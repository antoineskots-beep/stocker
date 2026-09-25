import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/auth-session';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase-types';

export type AlertItem = Database['public']['Tables']['alerts']['Row'];

export type CreateAlertInput = {
  symbol: string;
  type: 'price_above' | 'price_below' | 'buy_zone';
  rule: 'fixed_price';
  value: number;
};

export function alertsQueryKey(userId: string | undefined) {
  return ['alerts', userId] as const;
}

export function useAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: alertsQueryKey(user?.id),
    enabled: Boolean(user),
    queryFn: async (): Promise<AlertItem[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useCreateAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAlertInput) => {
      if (!user) {
        throw new Error('not_authenticated');
      }

      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          symbol: input.symbol.toUpperCase(),
          type: input.type,
          rule: input.rule,
          value: input.value,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: alertsQueryKey(user?.id) });
    },
  });
}

export function useDeleteAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('not_authenticated');
      }

      const { error } = await supabase.from('alerts').delete().eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: alertsQueryKey(user?.id) });
    },
  });
}

export function usePauseAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'paused' | 'active' }) => {
      if (!user) {
        throw new Error('not_authenticated');
      }

      const { error } = await supabase
        .from('alerts')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: alertsQueryKey(user?.id) });
    },
  });
}

export function useReactivateAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('not_authenticated');
      }

      const { error } = await supabase
        .from('alerts')
        .update({ status: 'active', triggered_at: null })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: alertsQueryKey(user?.id) });
    },
  });
}
