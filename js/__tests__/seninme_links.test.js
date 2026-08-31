'use strict';

import {
  buildSharedTopicUrl,
  isSeninMeUrl,
  isUserApiAuthUrl,
  parseSeninMeUrl,
  toLegacyDiscourseUrl,
} from '../seninme_links';

describe('Senin.me deep links', () => {
  test('only treats the configured Senin.me origin as internal', () => {
    expect(isSeninMeUrl('https://senin.me')).toBe(true);
    expect(isSeninMeUrl('https://senin.me/t/example/1')).toBe(true);
    expect(isSeninMeUrl('https://senin.me.evil.example/t/1')).toBe(false);
    expect(isSeninMeUrl('https://senin.me@evil.example/t/1')).toBe(false);
    expect(isSeninMeUrl('http://senin.me/t/example/1')).toBe(false);
    expect(isSeninMeUrl('https://example.com/https://senin.me')).toBe(false);
  });

  test('keeps User API Key authorization on the external auth path', () => {
    expect(isUserApiAuthUrl('https://senin.me/user-api-key/new')).toBe(true);
    expect(
      isUserApiAuthUrl('https://senin.me/user-api-key/new?client_id=abc'),
    ).toBe(true);
    expect(
      isUserApiAuthUrl('https://senin.me/user-api-key/new/extra'),
    ).toBe(false);
    expect(isUserApiAuthUrl('https://senin.me/latest')).toBe(false);
  });

  test('parses supported custom scheme parameters safely', () => {
    expect(
      parseSeninMeUrl(
        'seninme://open?url=https%3A%2F%2Fsenin.me%2Ft%2Fexample%2F1',
      ),
    ).toEqual({
      route: 'open',
      params: { url: 'https://senin.me/t/example/1' },
    });
  });

  test('does not treat non-Senin.me schemes as app deep links', () => {
    expect(parseSeninMeUrl('https://senin.me/latest')).toBeNull();
    expect(parseSeninMeUrl('discourse://auth_redirect?payload=x')).toBeNull();
  });

  test('keeps unknown routes explicit so the runtime can ignore them', () => {
    expect(parseSeninMeUrl('seninme://admin?next=%2Flatest')).toEqual({
      route: 'admin',
      params: { next: '/latest' },
    });
  });

  test('ignores malformed encoded parameters without falling through', () => {
    expect(
      parseSeninMeUrl(
        'seninme://open?url=%E0%A4%A&safe=https%3A%2F%2Fsenin.me%2Flatest',
      ),
    ).toEqual({
      route: 'open',
      params: { safe: 'https://senin.me/latest' },
    });
  });

  test('turns shared content into a Senin.me composer URL', () => {
    expect(buildSharedTopicUrl('https://example.com/a?b=1&c=2')).toBe(
      'https://senin.me/new-topic?body=https%3A%2F%2Fexample.com%2Fa%3Fb%3D1%26c%3D2',
    );
    expect(buildSharedTopicUrl('hello & merhaba')).toBe(
      'https://senin.me/new-topic?body=hello%20%26%20merhaba',
    );
  });

  test('converts only the Senin.me scheme prefix for legacy auth handling', () => {
    expect(
      toLegacyDiscourseUrl('seninme://auth_redirect?payload=encrypted'),
    ).toBe('discourse://auth_redirect?payload=encrypted');
  });
});
