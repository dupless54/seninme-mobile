/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const workflows = [
  ['Android Build', '.github/workflows/android-build.yml'],
  ['Linting', '.github/workflows/linting.yml'],
  ['Jest Tests', '.github/workflows/jest-tests.yml'],
  ['iOS tests', '.github/workflows/ios-tests.yml'],
];

describe('Senin.me pull-request CI isolation', () => {
  test.each(workflows)('%s isolates concurrency by PR number', (_name, file) => {
    const workflow = read(file);

    expect(workflow).toContain(
      '${{ github.event.pull_request.number || github.ref }}',
    );
    expect(workflow).not.toContain('github.head_ref');
  });
});
