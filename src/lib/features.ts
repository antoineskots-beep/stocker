export type Feature =
  | 'rule_based_buy_zones'
  | 'event_alerts'
  | 'email_alerts'
  | 'weekly_digest'
  | 'full_charts';

export type Tier = 'free' | 'premium';

/**
 * Single map that decides which tier unlocks each feature.
 * Move a feature to `free` here to ungated it everywhere `hasFeature` is used.
 */
export const FEATURE_TIERS: Record<Feature, Tier> = {
  rule_based_buy_zones: 'premium',
  event_alerts: 'premium',
  email_alerts: 'premium',
  weekly_digest: 'premium',
  full_charts: 'premium',
};

export function hasFeature(feature: Feature, isPremium: boolean): boolean {
  return FEATURE_TIERS[feature] === 'free' || isPremium;
}
