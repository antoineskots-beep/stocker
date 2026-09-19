export const en = {
  appName: 'Stocker',
  promise: 'Never miss your entry price.',
  delayedPrices: 'Prices delayed up to 15 minutes.',
  disclaimer:
    'Prices are for information only and are not investment advice.',

  onboarding: {
    title: 'Watch your names. Buy at your price.',
    body: 'Add stocks and ETFs, set a buy zone, and Stocker notifies you when the price gets there. No brokerage, no crypto — just your entry points.',
    cta: 'Get started',
    hasAccount: 'I already have an account',
  },

  auth: {
    signInTitle: 'Sign in',
    signUpTitle: 'Create an account',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signUp: 'Create account',
    continueWithApple: 'Continue with Apple',
    continueWithGoogle: 'Continue with Google',
    orEmail: 'or use email',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    checkEmail: 'Check your inbox to confirm your account, then come back to sign in.',
    missingConfig:
      'Supabase is not configured. Copy .env.example to .env and add your project URL and anon key.',
    invalidCredentials: 'Incorrect email or password.',
    weakPassword: 'Password must be at least 8 characters.',
    genericError: 'Something went wrong. Please try again.',
    appleUnavailable: 'Apple Sign In is not available on this device.',
  },

  tabs: {
    watchlist: 'Watchlist',
    alerts: 'Alerts',
    settings: 'Settings',
  },

  watchlist: {
    title: 'Watchlist',
    emptyTitle: 'Your list is empty',
    emptyBody: 'Search and adding names land in the next milestone. Your account is ready.',
  },

  alerts: {
    title: 'Alerts',
    emptyTitle: 'No alerts yet',
    emptyBody: 'You’ll set buy prices and thresholds here once the alert engine is in place.',
  },

  settings: {
    title: 'Settings',
    account: 'Account',
    signedInAs: 'Signed in as',
    language: 'Language',
    french: 'Français',
    english: 'English',
    signOut: 'Sign out',
    comingSoon: 'Subscription, notifications, and account deletion come in later milestones.',
  },

  states: {
    loading: 'Loading…',
    errorTitle: 'Couldn’t load',
    retry: 'Try again',
  },
} as const;
