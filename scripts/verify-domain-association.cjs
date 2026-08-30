'use strict';

const https = require('https');

const DOMAIN = 'senin.me';
const ANDROID_PACKAGE = 'me.senin.mobile';
const IOS_BUNDLE_ID = 'me.senin.mobile';
const HANDLE_ALL_URLS = 'delegate_permission/common.handle_all_urls';

function requireEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeFingerprint(value) {
  return value.replace(/\s+/g, '').toUpperCase();
}

function fetchJson(path) {
  const url = `https://${DOMAIN}${path}`;

  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Senin.me-domain-association-verifier/1.0',
        },
      },
      response => {
        const chunks = [];

        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          if (response.statusCode !== 200) {
            reject(
              new Error(
                `${url} returned HTTP ${response.statusCode}; association endpoints must be served directly with HTTP 200`,
              ),
            );
            return;
          }

          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (error) {
            reject(new Error(`${url} did not return valid JSON: ${error.message}`));
          }
        });
      },
    );

    request.setTimeout(10000, () => {
      request.destroy(new Error(`${url} timed out after 10 seconds`));
    });
    request.on('error', reject);
  });
}

function verifyAndroid(statements, expectedFingerprint) {
  if (!Array.isArray(statements)) {
    throw new Error('assetlinks.json must contain a JSON array');
  }

  const match = statements.find(statement => {
    const target = statement?.target;
    const fingerprints = target?.sha256_cert_fingerprints || [];

    return (
      statement?.relation?.includes(HANDLE_ALL_URLS) &&
      target?.namespace === 'android_app' &&
      target?.package_name === ANDROID_PACKAGE &&
      fingerprints.some(
        fingerprint =>
          normalizeFingerprint(fingerprint) === expectedFingerprint,
      )
    );
  });

  if (!match) {
    throw new Error(
      `assetlinks.json does not authorize ${ANDROID_PACKAGE} with the configured release certificate fingerprint`,
    );
  }
}

function verifyApple(document, teamId) {
  const expectedAppId = `${teamId}.${IOS_BUNDLE_ID}`;
  const details = document?.applinks?.details;

  if (!Array.isArray(details)) {
    throw new Error(
      'apple-app-site-association must contain applinks.details as an array',
    );
  }

  const appIds = details.flatMap(detail => [
    detail?.appID,
    ...(Array.isArray(detail?.appIDs) ? detail.appIDs : []),
  ]);

  if (!appIds.includes(expectedAppId)) {
    throw new Error(
      `apple-app-site-association does not authorize ${expectedAppId}`,
    );
  }
}

async function main() {
  const fingerprint = normalizeFingerprint(
    requireEnvironment('SENINME_ANDROID_SHA256_CERT_FINGERPRINT'),
  );
  const teamId = requireEnvironment('SENINME_IOS_TEAM_ID');

  const [assetLinks, appleAssociation] = await Promise.all([
    fetchJson('/.well-known/assetlinks.json'),
    fetchJson('/.well-known/apple-app-site-association'),
  ]);

  verifyAndroid(assetLinks, fingerprint);
  verifyApple(appleAssociation, teamId);

  console.log(
    `Verified Android App Links and iOS Universal Links for https://${DOMAIN}`,
  );
}

main().catch(error => {
  console.error(`Domain association verification failed: ${error.message}`);
  process.exitCode = 1;
});
