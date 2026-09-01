# Senin.me Single-Site Recovery

Senin.me Mobile is configured as a single-community application. Users must never be sent to the inherited Discourse multi-site onboarding flow when the configured community cannot be discovered.

## Startup behavior

1. The app loads the stored Senin.me site when available.
2. If no stored site exists, it discovers `APP_CONFIG.defaultSiteUrl`.
3. While discovery is running, Home shows the Senin.me loading state.
4. If discovery fails, Home shows the Senin.me recovery card instead of the legacy multi-site onboarding screen.
5. **Try again** calls `SiteManager.retryConfiguredSite()`, which re-discovers only the configured Senin.me URL.
6. A successful retry stores the recovered site, updates the native menu, emits the normal SiteManager change event, and returns Home to the native Senin.me feed.

## Compatibility

The legacy `OnBoardingView` remains in the codebase for upstream multi-site compatibility, but the Senin.me single-site path returns before it can render.

## Localization

Recovery copy is provided directly in English and Turkish. Other supported locales use the existing i18n English fallback until dedicated translations are added.
