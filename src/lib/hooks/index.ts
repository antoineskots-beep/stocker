export { useEvents } from '@/lib/hooks/use-events';
export { useQuote, useQuotes } from '@/lib/hooks/use-quotes';
export { useDebouncedValue, useSearch } from '@/lib/hooks/use-search';
export {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
  watchlistQueryKey,
} from '@/lib/hooks/use-watchlist';
export type { WatchlistItem } from '@/lib/hooks/use-watchlist';
export {
  alertsQueryKey,
  useAlerts,
  useCreateAlert,
  useDeleteAlert,
  usePauseAlert,
  useReactivateAlert,
} from '@/lib/hooks/use-alerts';
export type { AlertItem, CreateAlertInput } from '@/lib/hooks/use-alerts';
