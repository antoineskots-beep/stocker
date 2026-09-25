# Stocker

Cross-platform (iOS + Android) app for French-speaking Canadian long-term investors. Watch a list of stocks and ETFs and get notified when a price reaches your buy zone.

**Product promise:** *Ne ratez plus jamais votre prix d'entrée.*

## Milestone 3 (current)

- Price & buy-zone alert creation UI via bell icon on Watchlist rows (`src/components/create-alert-modal.tsx`)
- Alerts management tab grouped by Active & Triggered, with pause, resume, reactivate, and delete actions (`src/app/(app)/(tabs)/alerts.tsx`)
- Push notification permission request, token registration into `push_tokens`, and settings status toggle (`src/lib/notifications.ts`, `src/app/(app)/(tabs)/settings.tsx`)
- Server-side alert engine as a Supabase Edge Function (`supabase/functions/check-alerts/`) with pure rule evaluation, batch quote processing, and `alert_runs` audit logging
- Expo push notification dispatch with automatic removal of invalid tokens (`DeviceNotRegistered`)
- Scheduled evaluation migration documented via `pg_cron` (`supabase/migrations/0002_alerts_cron.sql`)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- [Expo Go](https://expo.dev/go) on a physical device, or Android Studio / Xcode simulators
- A [Supabase](https://supabase.com/) project (free tier is fine for development)

Optional for social sign-in:

- [Apple Developer](https://developer.apple.com/) — Sign in with Apple (iOS builds / device)
- [Google Cloud Console](https://console.cloud.google.com/) — OAuth 2.0 client IDs for Google sign-in

## Setup

1. **Install dependencies**

   ```bash
   cd stocker
   npm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in at minimum:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Later | Service role key (Edge Functions, Milestone 3+) |
   | `SUPABASE_DB_URL` | Later | Direct Postgres URL (migrations / cron) |
   | `EXPO_PUBLIC_MARKET_DATA_PROVIDER` | No | `mock` (default) until Milestone 2 |
   | `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | No | Google OAuth client IDs (web + iOS + Android) |

3. **Apply the database schema**

   In the [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql), paste and run:

   `supabase/migrations/0001_init.sql`

   Or with the [Supabase CLI](https://supabase.com/docs/guides/cli):

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

4. **Configure Supabase Auth**

   - **Email:** enabled by default. Turn off "Confirm email" in Auth settings if you want instant sign-up during dev.
   - **Apple:** Auth → Providers → Apple. Add your Services ID and key for production builds.
   - **Google:** Auth → Providers → Google. Paste the **Web client ID** and secret. Add the same Web client ID to `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, plus platform-specific IDs for native Google sign-in.

5. **Run the app**

   ```bash
   npx expo start
   ```

   Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Project layout

```
src/
  app/              Expo Router screens (auth, tabs, search, stock detail)
    (app)/
      (tabs)/       Watchlist, Alerts, Settings
      search.tsx    Search & add stocks modal screen
      stock/
        [symbol].tsx Stock detail screen
  components/       Shared UI (Button, BellIcon, CreateAlertModal, ExchangeBadge, Sparkline, ScreenState, etc.)
  constants/        Theme tokens (Colors, Spacing, Fonts)
  hooks/            Theme / color scheme
  lib/
    auth.ts         Email, Apple, Google sign-in helpers
    features.ts     hasFeature() tier gating map
    hooks/          TanStack Query hooks (useWatchlist, useAlerts, useQuotes, useEvents, useSearch, etc.)
    i18n/           French + English strings
    market-data/    MarketDataProvider interface + mock
    notifications.ts Push notification permissions & Expo token registration
    supabase.ts     Supabase client (SecureStore on native)
supabase/
  functions/
    check-alerts/   Supabase Edge Function (pure evaluator, quotes, push dispatch)
  migrations/       SQL schema + RLS policies + pg_cron migration
```

## Testing the Alert Engine & Push Notifications

### 1. Triggering an Alert Immediately via Mock Overrides

You can invoke the `check-alerts` Edge Function locally via the Supabase CLI or directly with `curl`:

```bash
# Set a target on a stock in the app (e.g., AAPL with target $230)
# Then call check-alerts with a price override higher than the target:
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-alerts' \
  --header 'Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{"mock_prices": {"AAPL": 240.0}}'
```

The function will:
1. Mark the AAPL alert as `status: 'triggered'` in the `alerts` table.
2. Dispatch a push notification to any tokens in `push_tokens` for that user.
3. Log the outcome in the `alert_runs` table.
4. Clean up any invalid push tokens.

### 2. Push Notifications & Expo Go

- Remote push notification token registration (`getExpoPushTokenAsync`) requires a **physical device** and an **EAS development build** (`npx expo run:ios` or `npx expo run:android`).
- In Expo Go (SDK 51+), remote push registration is safely bypassed to prevent crashes. Local permission checks and alert creation/management remain fully functional.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Start with iOS simulator |
| `npm run android` | Start with Android emulator |
| `npm run web` | Start on Web |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Typecheck |

## License

See [LICENSE](./LICENSE).


