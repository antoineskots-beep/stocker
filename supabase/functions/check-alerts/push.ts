export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
};

export type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'MessageTooBig' | 'MessageRateExceeded' | string;
  };
};

export type PushSendResult = {
  sentCount: number;
  invalidTokens: string[];
};

/**
 * Sends notifications via Expo Push API and identifies invalid tokens (DeviceNotRegistered).
 */
export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<PushSendResult> {
  if (messages.length === 0) {
    return { sentCount: 0, invalidTokens: [] };
  }

  const invalidTokens: string[] = [];
  let sentCount = 0;

  // Expo push API handles up to 100 messages per chunk
  const CHUNK_SIZE = 100;
  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);

    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(chunk),
      });

      if (!res.ok) {
        console.error('Expo push API error status:', res.status, await res.text());
        continue;
      }

      const json = await res.json();
      const tickets: ExpoPushTicket[] = json.data ?? [];

      tickets.forEach((ticket, idx) => {
        if (ticket.status === 'ok') {
          sentCount++;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          const failedToken = chunk[idx]?.to;
          if (failedToken) {
            invalidTokens.push(failedToken);
          }
        }
      });
    } catch (err) {
      console.error('Failed to post chunk to Expo push API:', err);
    }
  }

  return { sentCount, invalidTokens };
}
