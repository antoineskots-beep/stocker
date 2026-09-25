import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

import { evaluateAlert } from './evaluator.ts';
import { sendExpoPushNotifications, type ExpoPushMessage } from './push.ts';
import { fetchServerQuotes } from './quotes.ts';

Deno.serve(async (req: Request) => {
  const startedAt = new Date().toISOString();

  // Allow manual invocation with custom mock prices or options
  let bodyPayload: {
    mock_prices?: Record<string, number>;
    skip_push?: boolean;
  } = {};

  if (req.method === 'POST') {
    try {
      const text = await req.text();
      if (text) {
        bodyPayload = JSON.parse(text);
      }
    } catch {
      // Use defaults if empty or non-JSON
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // 1. Log start to alert_runs
  const { data: runRecord } = await supabaseAdmin
    .from('alert_runs')
    .insert({
      kind: 'quote_eval',
      status: 'ok',
      started_at: startedAt,
      symbols_processed: 0,
      alerts_triggered: 0,
    })
    .select('id')
    .single();

  const runId = runRecord?.id;

  try {
    // 2. Fetch active alerts
    const { data: activeAlerts, error: fetchAlertsError } = await supabaseAdmin
      .from('alerts')
      .select('*')
      .eq('status', 'active');

    if (fetchAlertsError) {
      throw fetchAlertsError;
    }

    type AlertRow = {
      id: string;
      user_id: string;
      symbol: string;
      type: string;
      rule?: string | null;
      value: number | null;
      status: string;
    };

    type PushTokenRow = {
      token: string;
    };

    const alerts = (activeAlerts as AlertRow[] | null) ?? [];
    const distinctSymbols: string[] = Array.from(
      new Set(alerts.map((a: AlertRow) => a.symbol.toUpperCase())),
    );

    // 3. Fetch server quotes for active symbols
    const quotesMap = await fetchServerQuotes(distinctSymbols, bodyPayload.mock_prices);

    const triggeredAlertIds: string[] = [];
    const pushMessages: ExpoPushMessage[] = [];
    const userTokensCache = new Map<string, string[]>();

    // 4. Evaluate each alert
    for (const alert of alerts) {
      const quote = quotesMap.get(alert.symbol.toUpperCase());
      if (!quote) continue;

      const triggered = evaluateAlert(
        {
          type: alert.type,
          rule: alert.rule,
          value: alert.value,
        },
        quote,
      );

      if (triggered) {
        triggeredAlertIds.push(alert.id);

        // Mark as triggered in database
        await supabaseAdmin
          .from('alerts')
          .update({
            status: 'triggered',
            triggered_at: new Date().toISOString(),
          })
          .eq('id', alert.id);

        if (!bodyPayload.skip_push) {
          // Fetch user push tokens (cached per user in this run)
          let tokens = userTokensCache.get(alert.user_id);
          if (tokens === undefined) {
            const { data: pushTokenRows } = await supabaseAdmin
              .from('push_tokens')
              .select('token')
              .eq('user_id', alert.user_id);

            tokens = ((pushTokenRows as PushTokenRow[] | null) ?? []).map((r) => r.token);
            userTokensCache.set(alert.user_id, tokens);
          }

          const targetStr = alert.value != null ? `$${alert.value.toFixed(2)}` : '';
          const currentPriceStr = `$${quote.price.toFixed(2)}`;

          for (const token of tokens ?? []) {
            pushMessages.push({
              to: token,
              title: `${alert.symbol} • Alert triggered`,
              body: `${alert.symbol} reached ${currentPriceStr} (target was ${targetStr}).`,
              data: {
                symbol: alert.symbol,
                alertId: alert.id,
              },
              sound: 'default',
            });
          }
        }
      }
    }

    // 5. Send push notifications
    const { sentCount, invalidTokens } = await sendExpoPushNotifications(pushMessages);

    // 6. Remove invalid tokens from push_tokens table
    if (invalidTokens.length > 0) {
      await supabaseAdmin.from('push_tokens').delete().in('token', invalidTokens);
    }

    const finishedAt = new Date().toISOString();

    // 7. Update alert_runs log
    if (runId) {
      await supabaseAdmin
        .from('alert_runs')
        .update({
          finished_at: finishedAt,
          status: 'ok',
          symbols_processed: distinctSymbols.length,
          alerts_triggered: triggeredAlertIds.length,
          details: {
            triggered_alert_ids: triggeredAlertIds,
            push_messages_queued: pushMessages.length,
            push_messages_sent: sentCount,
            invalid_tokens_removed: invalidTokens.length,
          },
        })
        .eq('id', runId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        symbols_processed: distinctSymbols.length,
        alerts_evaluated: alerts.length,
        alerts_triggered: triggeredAlertIds.length,
        triggered_ids: triggeredAlertIds,
        pushes_sent: sentCount,
        invalid_tokens_removed: invalidTokens.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in check-alerts function:', errorMsg);

    if (runId) {
      await supabaseAdmin
        .from('alert_runs')
        .update({
          finished_at: new Date().toISOString(),
          status: 'error',
          error: errorMsg,
        })
        .eq('id', runId);
    }

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
