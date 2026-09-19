# Stocker

Cross-platform (iOS + Android) app for French-speaking Canadian long-term investors. Watch a list of stocks and ETFs and get notified when a price reaches your buy zone.

**Product promise:** *Ne ratez plus jamais votre prix d'entrée.*

## Milestone 1 (current)

- Expo (React Native) + TypeScript + Expo Router
- Supabase Auth (email; Apple on iOS; Google when OAuth client IDs are set)
- Postgres schema with row-level security (`supabase/migrations/0001_init.sql`)
- Mock market data provider (`src/lib/market-data/`)
- French + English i18n (defaults to French when the device language is French)
- Onboarding, sign-in/sign-up, tab shell (Watchlist, Alerts, Settings)

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
  app/              Expo Router screens (auth + main tabs)
  components/       Shared UI
  constants/        Theme tokens
  hooks/            Theme / color scheme
  lib/
    auth.ts         Email, Apple, Google sign-in helpers
    features.ts     hasFeature() tier gating map
    i18n/           French + English strings
    market-data/    MarketDataProvider interface + mock
    supabase.ts     Supabase client (SecureStore on native)
supabase/
  migrations/       SQL schema + RLS policies
```

## Accounts to create (by milestone)

| Milestone | Service | Purpose |
|-----------|---------|---------|
| 1 | Supabase | Auth, Postgres, RLS |
| 1 | Google Cloud (optional) | Google sign-in OAuth clients |
| 1 | Apple Developer (optional) | Sign in with Apple on iOS |
| 2 | Market data API (your choice) | Delayed quotes for TSX, NEO, US |
| 3 | Expo (EAS) | Push notification credentials |
| 4 | RevenueCat | Subscriptions (`premium` entitlement) |
| 4 | Resend | Transactional email + weekly digest |

## Push notifications (Milestone 3)

Testing push requires a **development build** or **EAS Build** on a **physical device** — Expo Go has limitations for push in SDK 53+. Steps will be documented when the alert engine lands.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Start with iOS simulator |
| `npm run android` | Start with Android emulator |
| `npx tsc --noEmit` | Typecheck |

## License

See [LICENSE](./LICENSE).
