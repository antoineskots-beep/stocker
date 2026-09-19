export const fr = {
  appName: 'Stocker',
  promise: 'Ne ratez plus jamais votre prix d’entrée.',
  delayedPrices: 'Cours retardés d’au plus 15 minutes.',
  disclaimer:
    'Les cours sont fournis à titre informatif et ne constituent pas un conseil en investissement.',

  onboarding: {
    title: 'Surveillez vos titres, achetez à votre prix.',
    body: 'Ajoutez des actions et des FNB à votre liste, définissez une zone d’achat, et Stocker vous avise quand le cours s’en approche. Pas de courtage, pas de crypto : seulement vos points d’entrée.',
    cta: 'Commencer',
    hasAccount: 'J’ai déjà un compte',
  },

  auth: {
    signInTitle: 'Connexion',
    signUpTitle: 'Créer un compte',
    email: 'Courriel',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signUp: 'Créer mon compte',
    continueWithApple: 'Continuer avec Apple',
    continueWithGoogle: 'Continuer avec Google',
    orEmail: 'ou par courriel',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
    checkEmail: 'Consultez votre boîte de courriel pour confirmer votre compte, puis revenez vous connecter.',
    missingConfig:
      'Supabase n’est pas configuré. Copiez .env.example vers .env et ajoutez l’URL et la clé anon du projet.',
    invalidCredentials: 'Courriel ou mot de passe incorrect.',
    weakPassword: 'Le mot de passe doit contenir au moins 8 caractères.',
    genericError: 'Une erreur s’est produite. Réessayez dans un instant.',
    appleUnavailable: 'La connexion Apple n’est pas disponible sur cet appareil.',
  },

  tabs: {
    watchlist: 'Liste',
    alerts: 'Alertes',
    settings: 'Réglages',
  },

  watchlist: {
    title: 'Liste de suivi',
    add: 'Ajouter',
    search: 'Rechercher un titre',
    emptyTitle: 'Votre liste est vide',
    emptyBody: 'La recherche et l’ajout de titres arrivent à l’étape suivante. Pour l’instant, votre compte est prêt.',
  },

  search: {
    title: 'Recherche',
    placeholder: 'Symbole ou nom de la société',
    add: 'Ajouter',
    added: 'Déjà ajouté',
    hintTitle: 'Trouvez un titre',
    hintBody: 'Entrez un symbole (VFV.TO) ou un nom (Shopify).',
    emptyTitle: 'Aucun résultat',
    emptyBody: 'Essayez un autre symbole ou le nom de la société.',
    addFailed: 'Impossible d’ajouter ce titre. Réessayez.',
  },

  alerts: {
    title: 'Alertes',
    emptyTitle: 'Aucune alerte',
    emptyBody: 'Vous pourrez fixer un prix d’achat et des seuils ici dès que le moteur d’alertes sera en place.',
  },

  settings: {
    title: 'Réglages',
    account: 'Compte',
    signedInAs: 'Connecté avec',
    language: 'Langue',
    french: 'Français',
    english: 'English',
    signOut: 'Se déconnecter',
    comingSoon: 'Abonnement, notifications et suppression du compte : étapes suivantes.',
  },

  states: {
    loading: 'Chargement…',
    errorTitle: 'Impossible de charger',
    retry: 'Réessayer',
  },
} as const;
