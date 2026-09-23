import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import {
  DEFAULT_THEME_MODE,
  THEME_MODES,
  THEME_STORAGE_KEY,
  applyTheme,
  followsSystem,
  isThemeMode,
  parseThemeMode,
  readStoredMode,
  resolveTheme,
  writeStoredMode
} from '../src/lib/theme.ts';

/**
 * The rules a visitor actually feels: what System means, what an explicit
 * choice overrides, and what happens when storage is hostile.
 */

/** Minimal Storage stand-in. `failing` models a browser that blocks site data. */
function fakeStorage({ initial = {}, failing = false } = {}) {
  const data = { ...initial };
  return {
    getItem(key) {
      if (failing) throw new Error('storage blocked');
      return key in data ? data[key] : null;
    },
    setItem(key, value) {
      if (failing) throw new Error('storage blocked');
      data[key] = value;
    },
    dump: () => ({ ...data })
  };
}

test('exactly three modes exist, and System is the default', () => {
  assert.deepEqual([...THEME_MODES], ['light', 'dark', 'system']);
  assert.equal(DEFAULT_THEME_MODE, 'system');
});

test('mode recognition accepts only the three modes', () => {
  ['light', 'dark', 'system'].forEach((mode) => assert.equal(isThemeMode(mode), true));
  ['Light', 'DARK', 'auto', '', null, undefined, 0, {}, []].forEach((value) =>
    assert.equal(isThemeMode(value), false, `accepted ${JSON.stringify(value)}`)
  );
});

test('an invalid stored value falls back to the default instead of breaking', () => {
  ['', 'auto', 'null', '{}', 'LIGHT', null, undefined, 42].forEach((value) => {
    assert.equal(parseThemeMode(value), 'system', `bad parse for ${JSON.stringify(value)}`);
  });
  assert.equal(parseThemeMode('dark'), 'dark');
});

test('Light and Dark resolve to themselves whatever the device reports', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('light', false), 'light');
  assert.equal(resolveTheme('dark', true), 'dark');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('System resolves to the device preference', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
});

test('only System follows a device preference change', () => {
  assert.equal(followsSystem('system'), true);
  assert.equal(followsSystem('light'), false);
  assert.equal(followsSystem('dark'), false);
});

test('an OS change repaints System and is ignored by an explicit choice', () => {
  /* The device flips light -> dark while each mode is active. */
  const before = { system: resolveTheme('system', false), light: resolveTheme('light', false), dark: resolveTheme('dark', false) };
  const after = { system: resolveTheme('system', true), light: resolveTheme('light', true), dark: resolveTheme('dark', true) };
  assert.notEqual(before.system, after.system, 'System must follow the device');
  assert.equal(before.light, after.light, 'an explicit Light must outrank the device');
  assert.equal(before.dark, after.dark, 'an explicit Dark must outrank the device');
});

test('the persisted value is the MODE, never the resolved colour', () => {
  const storage = fakeStorage();
  writeStoredMode('system', storage);
  assert.equal(storage.dump()[THEME_STORAGE_KEY], 'system');
  /*
   * Storing 'dark' here because the OS happened to be dark would freeze a
   * System visitor into dark forever — the bug this assertion exists to catch.
   */
  assert.notEqual(storage.dump()[THEME_STORAGE_KEY], resolveTheme('system', true));
});

test('a stored mode round-trips', () => {
  const storage = fakeStorage();
  THEME_MODES.forEach((mode) => {
    writeStoredMode(mode, storage);
    assert.equal(readStoredMode(storage), mode);
  });
});

test('blocked storage degrades to the default rather than throwing', () => {
  const storage = fakeStorage({ failing: true });
  assert.equal(readStoredMode(storage), 'system');
  assert.doesNotThrow(() => writeStoredMode('dark', storage));
});

test('a corrupt stored value reads back as the default', () => {
  const storage = fakeStorage({ initial: { [THEME_STORAGE_KEY]: 'chartreuse' } });
  assert.equal(readStoredMode(storage), 'system');
});

test('applying a theme sets both the attribute and color-scheme', () => {
  const root = { dataset: {}, style: {} };
  applyTheme('dark', root);
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(root.style.colorScheme, 'dark');
  applyTheme('light', root);
  assert.equal(root.dataset.theme, 'light');
  assert.equal(root.style.colorScheme, 'light');
});

/**
 * The inline bootstrap in index.html paints before React exists, so it is a
 * second implementation of the same rules. If it and `lib/theme.ts` disagree
 * the visitor sees a flash of the wrong theme — these assertions keep the two
 * honest about the parts that must match exactly.
 */
test('the no-flash bootstrap agrees with the theme module', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes(THEME_STORAGE_KEY), 'bootstrap reads a different storage key');
  assert.ok(html.includes('(prefers-color-scheme: dark)'), 'bootstrap checks a different query');
  assert.ok(html.includes('documentElement.dataset.theme'), 'bootstrap sets a different attribute');
  assert.ok(html.includes('colorScheme'), 'bootstrap does not set color-scheme');
  THEME_MODES.forEach((mode) => {
    assert.ok(html.includes(`'${mode}'`), `bootstrap does not handle the ${mode} mode`);
  });
  /* It must run before the app script, or it cannot prevent the flash. */
  assert.ok(
    html.indexOf('pdabliss.theme') < html.indexOf('src="/src/main'),
    'the bootstrap must come before the app entry script'
  );
});

/**
 * The token layer is the whole dark mode. These guard the two invariants that
 * silently break it: A&I must be excluded, and the always-dark sections must
 * keep their light-on-green text.
 */
test('the token layer keeps A&I and the always-dark sections out of the inversion', () => {
  const css = readFileSync(new URL('../src/styles/theme-tokens.css', import.meta.url), 'utf8');
  assert.ok(
    css.includes("body:not([data-theme='ai'])"),
    'the dark block must exclude the A&I experience'
  );
  ['.sect--mesh', '.sect--deep', '.sect--immersive', '.sect--horizon', '.on-dark'].forEach((sel) => {
    assert.ok(css.includes(sel), `${sel} is missing from the always-dark island`);
  });
  /* Every corporate scale entry the Tailwind config resolves through. */
  ['--c-white', '--c-ink', '--c-steel-500', '--c-brand-500'].forEach((token) => {
    assert.ok(css.includes(token), `${token} is not defined`);
  });
});

test('the Tailwind corporate scale resolves through the tokens, and A&I does not', () => {
  const config = readFileSync(new URL('../tailwind.config.ts', import.meta.url), 'utf8');
  assert.ok(config.includes("rgb(var(--c-${name}) / <alpha-value>)"), 'the themed() helper changed shape');
  ["white: themed('white')", "DEFAULT: themed('ink')", "500: themed('steel-500')", "500: themed('brand-500')"].forEach(
    (entry) => assert.ok(config.includes(entry), `${entry} is not themed`)
  );
  /* A&I's palette must stay literal so the corporate theme cannot reach it. */
  assert.ok(config.includes("#7EC8FF"), 'the A&I sky primary should remain a literal');
});

/**
 * THE REGRESSION THIS FILE EXISTS TO PREVENT
 *
 * A container that paints its own fixed dark colour and puts `text-white` on
 * it is correct in light mode and broken in dark: the ground stays dark while
 * the token behind `text-white` inverts to near-black. It is invisible in
 * review because the light theme looks perfect.
 *
 * `.on-dark` pins the corporate tokens back to their light values for exactly
 * this case. This test walks the corporate source and fails if a fixed-dark
 * surface carrying light text forgets it.
 */
test('every fixed-dark surface with light text is marked on-dark', () => {
  const roots = [
    new URL('../src/components/business/', import.meta.url),
    new URL('../src/pages/business/', import.meta.url)
  ];
  /* Dark greens and near-blacks the brand actually paints with. */
  const DARK_LITERAL = /#0[0-9A-Fa-f]{5}|#(?:063B2A|0B5137|04261B|031b13|112538)\b|rgba?\(\s*[0-9]{1,2}\s*,\s*[0-9]{1,2}\s*,\s*[0-9]{1,2}\s*[,)]/i;
  const offenders = [];
  for (const dir of roots) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.tsx')) continue;
      const file = new URL(name, dir);
      const src = readFileSync(file, 'utf8');
      /* Each arbitrary background value, with the class list around it. */
      for (const m of src.matchAll(/className=\{?["'`]([^"'`]*bg-\[[^\]]*\][^"'`]*)["'`]/g)) {
        const cls = m[1];
        const bg = (cls.match(/bg-\[[^\]]*\]/) || [''])[0];
        const fixedDark = DARK_LITERAL.test(bg);
        const lightText = /\btext-white\b|\btext-brand-(100|200|300)\b/.test(cls);
        /* A transparent accent glow is decoration, not a surface. */
        const decorative = /transparent/.test(bg) && !/text-/.test(cls);
        if (fixedDark && lightText && !decorative && !/\bon-dark\b/.test(cls)) {
          offenders.push(`${name}: ${bg.slice(0, 60)}`);
        }
      }
    }
  }
  assert.deepEqual(offenders, [], `fixed-dark surfaces missing .on-dark:\n  ${offenders.join('\n  ')}`);
});

/**
 * The mirror image: a hardcoded LIGHT background cannot follow the theme, so
 * in dark mode it stays light while the text on it turns light too. Card and
 * panel grounds must come from tokens.
 */
test('no corporate surface hardcodes a light background literal', () => {
  const roots = [
    new URL('../src/components/business/', import.meta.url),
    new URL('../src/pages/business/', import.meta.url)
  ];
  const LIGHT_LITERAL = /#(?:fff|ffffff|f[0-9a-f]{5}|e[0-9a-f]{5})\b/i;
  const offenders = [];
  for (const dir of roots) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.tsx')) continue;
      const src = readFileSync(new URL(name, dir), 'utf8');
      for (const m of src.matchAll(/bg-\[[^\]]*\]/g)) {
        /* Mocks draw miniature UI; their internals are artwork, not surfaces. */
        if (name === 'SystemMock.tsx' || name === 'UIPreview.tsx') continue;
        if (LIGHT_LITERAL.test(m[0])) offenders.push(`${name}: ${m[0].slice(0, 70)}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `light backgrounds that cannot theme:\n  ${offenders.join('\n  ')}`);
});
