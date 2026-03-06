async function initSentry () {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  try {
    const sentryReact = '@sentry/react';
    const sentryTracing = '@sentry/tracing';
    const Sentry = await import(sentryReact);
    const { BrowserTracing } = await import(sentryTracing);
    Sentry.init({
      enabled: true,
      dsn: process.env.SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
    });
  } catch {
    // Sentry packages are optional in this build target.
  }
}

void initSentry();
