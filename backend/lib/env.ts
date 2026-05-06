function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  anthropicApiKey: () => required('ANTHROPIC_API_KEY'),
  firebaseProjectId: () => required('FIREBASE_PROJECT_ID'),
  firebasePrivateKey: () => required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  firebaseClientEmail: () => required('FIREBASE_CLIENT_EMAIL'),
  stripeSecretKey: () => required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: () => required('STRIPE_WEBHOOK_SECRET'),
  stripePriceDoerMonthly: () => required('STRIPE_PRICE_DOER_MONTHLY'),
  stripePriceDoerAnnual: () => required('STRIPE_PRICE_DOER_ANNUAL'),
  stripePriceScholarship: () => required('STRIPE_PRICE_SCHOLARSHIP'),
  googleCalendarClientId: () => required('GOOGLE_CALENDAR_CLIENT_ID'),
  googleCalendarClientSecret: () => required('GOOGLE_CALENDAR_CLIENT_SECRET'),
  higgsfieldApiKey: () => required('HIGGSFIELD_API_KEY'),
  appUrl: () => optional('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:5173',
};
