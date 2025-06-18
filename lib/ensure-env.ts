const required = [
  'DATABASE_URL',
  'DATABASE_AUTH_TOKEN',
  'SESSION_SECRET',
  'ASKELL_PRIVATE',
  'SAMSTODIN_EMAIL_ADDRESS',
  'SAMSTODIN_EMAIL_PASSWORD',
  'NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'EXTERNAL_HOST',
] as const;

let hasMissing = false;

console.log('[ENV VALIDATION] Checking for required environment variables...');

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[ENV VALIDATION] ❌ Missing required environment variable: ${key}`);
    hasMissing = true;
  }
}

if (hasMissing) {
  console.error('[ENV VALIDATION] Build failed due to missing environment variables. Please check deployment settings for the "Preview" environment.');
  process.exit(1);
} else {
  console.log('[ENV VALIDATION] ✅ All required environment variables are present.');
} 