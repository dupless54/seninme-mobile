'use strict';

const https = require('https');

const DOMAIN = 'senin.me';
const ANDROID_PACKAGE = 'me.senin.mobile';
const IOS_BUNDLE_ID = 'me.senin.mobile';
const HANDLE_ALL_URLS = 'delegate_permission/common.handle_all_urls';
const JSON_CONTENT_TYPE = /^application\/json\b/i;

function requireEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeFingerprint(value) {
  const normalized = value.replace(/[:\s]+/g, '').toUpperCase();

  if (!/^[A-F0-9]{64}$/.test(normalized)) {
    throw new Error(
      'SENINME_ANDROID_SHA256_CERT_FINGERPRINT must be a 32-byte SHA-256 certificate fingerprint',
    );
  }

  return normalized;
}

function requireAppleAppIdentifierPrefix() {
  const value = requireEnvironment('SENINME_IOS_APP_IDENTIFIER_PREFIX');

  if (!/^[A-Za-z0-9]{10}$/.test(value)) {
    throw new Error(
      'SENINME_IOS_APP_IDENTIFIER_PREFIX must be the 10-character App Identifier Prefix from the signed application identifier',
    );
  }

  return value;
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

          const contentType = response.headers['content-type'] || '';
          if (!JSON_CONTENT_TYPE.test(contentType)) {
            reject(
              new Error(
                `${url} returned Content-Type ${contentType || '(missing)'}; association JSON must be served as application/json`,
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

function enablesAllApplePaths(detail) {
  const paths = detail?.paths;
  if (Array.isArray(paths)) {
    const hasExclusion = paths.some(
      path => typeof path === 'string' && /^NOT\s+/i.test(path.trim()),
    );
    const hasAllPaths = paths.some(path => path === '*' || path === '/*');

    if (hasAllPaths && !hasExclusion) {
      return true;
    }
  }

  const components = detail?.components;
  if (!Array.isArray(components)) {
    return false;
  }

  // An excluded component can carve paths out of a later catch-all rule. The
  // Senin.me contract is intentionally stricter: all forum paths must be
  // eligible, so any explicit exclusion makes this detail fail closed.
  if (components.some(component => component?.exclude === true)) {
    return false;
  }

  return components.some(component => {
    const pathPattern = component?.['/'];
    return pathPattern === '*' || pathPattern === '/*';
  });
}

function verifyApple(document, appIdentifierPrefix) {
  const expectedAppId = `${appIdentifierPrefix}.${IOS_BUNDLE_ID}`;
  const details = document?.applinks?.details;

  if (!Array.isArray(details)) {
    throw new Error(
      'apple-app-site-association must contain applinks.details as an array',
    );
  }

  const match = details.find(detail => {
    const appIds = [
      detail?.appID,
      ...(Array.isArray(detail?.appIDs) ? detail.appIDs : []),
    ];

    return appIds.includes(expectedAppId) && enablesAllApplePaths(detail);
  });

  if (!match) {
    throw new Error(
      `apple-app-site-association does not authorize ${expectedAppId} for all Senin.me paths`,
    );
  }
}

async function main() {
  const fingerprint = normalizeFingerprint(
    requireEnvironment('SENINME_ANDROID_SHA256_CERT_FINGERPRINT'),
  );
  const appIdentifierPrefix = requireAppleAppIdentifierPrefix();

  const [assetLinks, appleAssociation] = await Promise.all([
    fetchJson('/.well-known/assetlinks.json'),
    fetchJson('/.well-known/apple-app-site-association'),
  ]);

  verifyAndroid(assetLinks, fingerprint);
  verifyApple(appleAssociation, appIdentifierPrefix);

  console.log(
    `Verified Android App Links and iOS Universal Links for https://${DOMAIN}`,
  );
}

main().catch(error => {
  console.error(`Domain association verification failed: ${error.message}`);
  process.exitCode = 1;
});
