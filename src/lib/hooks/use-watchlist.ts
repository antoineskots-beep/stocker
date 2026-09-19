import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/auth-session';
import { marketData } from '@/lib/market-data';
import type { SearchResult } from '@/lib/market-data/types';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase-types';

export type WatchlistItem = Database['public']['Tables']['watchlist_items']['Row'];

export function watchlistQueryKey(userId: string | undefined) {
  return ['watchlist', userId] as const;
}

export function useWatchlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: watchlistQueryKey(user?.id),
    enabled: Boolean(user),
    queryFn: async (): Promise<WatchlistItem[]> => {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useAddToWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: SearchResult) => {
      if (!user) {
        throw new Error('not_authenticated');
      }

      const quotes = await marketData.getQuotes([item.symbol]);
      const quote = quotes[0];
      if (!quote) {
        throw new Error('quote_unavailable');
      }

      const { count, error: countError } = await supabase
        .from('watchlist_items')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      const { error } = await supabase.from('watchlist_items').insert({
        user_id: user.id,
        symbol: item.symbol,
        company_name: item.name,
        exchange: item.exchange,
        currency: item.currency,
        position: count ?? 0,
        reference_price: quote.price,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: watchlistQueryKey(user?.id) });
    },
  });
}

export function useRemoveFromWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!user) {
        throw new Error('not_authenticated');
      }

      const { error } = await supabase.from('watchlist_items').delete().eq('symbol', symbol);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: watchlistQueryKey(user?.id) });
    },
  });
}
