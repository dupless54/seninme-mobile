/* eslint-env node */
'use strict';

const fs = require('fs');
const path = require('path');

const IOS_BUNDLE_ID = 'me.senin.mobile';
const ANDROID_PACKAGE_NAME = 'me.senin.mobile';

function requiredValue(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required value: ${name}`);
  }

  return String(value).trim();
}

function normalizeTeamId(value) {
  const teamId = requiredValue('SENINME_IOS_TEAM_ID', value).toUpperCase();

  if (!/^[A-Z0-9]{10}$/.test(teamId)) {
    throw new Error('SENINME_IOS_TEAM_ID must be a 10-character Apple Team ID');
  }

  return teamId;
}

function normalizeFingerprint(value) {
  const raw = requiredValue(
    'SENINME_ANDROID_SHA256_CERT_FINGERPRINT',
    value,
  )
    .replace(/:/g, '')
    .toUpperCase();

  if (!/^[A-F0-9]{64}$/.test(raw)) {
    throw new Error(
      'SENINME_ANDROID_SHA256_CERT_FINGERPRINT must contain 32 SHA-256 bytes',
    );
  }

  return raw.match(/.{2}/g).join(':');
}

function buildAppleAssociation(teamId) {
  const appId = `${teamId}.${IOS_BUNDLE_ID}`;

  return {
    applinks: {
      apps: [],
      details: [
        {
          appID: appId,
          paths: ['*'],
        },
      ],
    },
    activitycontinuation: {
      apps: [appId],
    },
    webcredentials: {
      apps: [appId],
    },
  };
}

function buildAndroidAssociation(fingerprint) {
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: ANDROID_PACKAGE_NAME,
        sha256_cert_fingerprints: [fingerprint],
      },
    },
  ];
}

function generateAssociationFiles({ teamId, fingerprint, outputDir }) {
  const normalizedTeamId = normalizeTeamId(teamId);
  const normalizedFingerprint = normalizeFingerprint(fingerprint);
  const wellKnownDir = path.join(outputDir, '.well-known');

  fs.mkdirSync(wellKnownDir, { recursive: true });

  const applePath = path.join(wellKnownDir, 'apple-app-site-association');
  const androidPath = path.join(wellKnownDir, 'assetlinks.json');

  fs.writeFileSync(
    applePath,
    `${JSON.stringify(buildAppleAssociation(normalizedTeamId), null, 2)}\n`,
  );
  fs.writeFileSync(
    androidPath,
    `${JSON.stringify(buildAndroidAssociation(normalizedFingerprint), null, 2)}\n`,
  );

  return {
    androidPath,
    applePath,
    fingerprint: normalizedFingerprint,
    teamId: normalizedTeamId,
  };
}

if (require.main === module) {
  const outputDir = process.env.SENINME_ASSOCIATION_OUTPUT_DIR
    ? path.resolve(process.env.SENINME_ASSOCIATION_OUTPUT_DIR)
    : path.resolve('build/association');

  const result = generateAssociationFiles({
    teamId: process.env.SENINME_IOS_TEAM_ID,
    fingerprint: process.env.SENINME_ANDROID_SHA256_CERT_FINGERPRINT,
    outputDir,
  });

  console.log(`Generated ${result.applePath}`);
  console.log(`Generated ${result.androidPath}`);
}

module.exports = {
  ANDROID_PACKAGE_NAME,
  IOS_BUNDLE_ID,
  buildAndroidAssociation,
  buildAppleAssociation,
  generateAssociationFiles,
  normalizeFingerprint,
  normalizeTeamId,
};
