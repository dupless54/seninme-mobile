from pathlib import Path

path = Path("js/site_manager.js")
source = path.read_text()

replacements = [
    (
        "import i18n from 'i18n-js';\n",
        "import i18n from 'i18n-js';\nimport APP_CONFIG from './app_config';\n",
    ),
    (
        "  customScheme = 'discourse';\n  urlScheme = 'discourse://auth_redirect';\n  deviceName = 'Discourse - Unknown Mobile Device';",
        "  customScheme = APP_CONFIG.customScheme;\n  urlScheme = APP_CONFIG.authRedirectUrl;\n  deviceName = `${APP_CONFIG.appName} - Unknown Mobile Device`;",
    ),
    (
        "      this.deviceName = `Discourse - ${name}`;",
        "      this.deviceName = `${APP_CONFIG.appName} - ${name}`;",
    ),
]

for old, new in replacements:
    if old not in source:
        raise SystemExit(f"Expected source fragment not found: {old!r}")
    source = source.replace(old, new, 1)

old_push = """          let basePushUrl = 'https://api.discourse.org';
          //let basePushUrl = \"http://l.discourse:3000\"

          let scopes = 'notifications,session_info,one_time_password';

          let params = {
            scopes: scopes,
            client_id: clientId,
            nonce: nonce,
            push_url: basePushUrl + '/api/publish_' + Platform.OS,
            auth_redirect: this.urlScheme,
            application_name: this.deviceName,
            public_key: this.rsaKeys.public,
            discourse_app: 1,
          };
"""

new_push = """          const pushBaseUrl = APP_CONFIG.pushBaseUrl
            ? APP_CONFIG.pushBaseUrl.replace(/\\/+$/, '')
            : null;
          let scopes = 'notifications,session_info,one_time_password';

          let params = {
            scopes: scopes,
            client_id: clientId,
            nonce: nonce,
            auth_redirect: this.urlScheme,
            application_name: this.deviceName,
            public_key: this.rsaKeys.public,
            discourse_app: 1,
          };

          if (pushBaseUrl) {
            params.push_url = `${pushBaseUrl}/api/publish_${Platform.OS}`;
          }
"""

if old_push not in source:
    raise SystemExit("Expected upstream push configuration was not found")

source = source.replace(old_push, new_push, 1)
path.write_text(source)
