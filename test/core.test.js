
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
} from '../src/index.js';

function assertClose(actual, expected, epsilon = 1e-9, message) {
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    message || `Expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

test('hexToRgb parses 6-digit hex with and without leading hash', () => {
  assert.deepEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('00ff00'), { r: 0, g: 255, b: 0 });
  assert.deepEqual(hexToRgb('#0000ff'), { r: 0, g: 0, b: 255 });
  assert.deepEqual(hexToRgb('#123456'), { r: 0x12, g: 0x34, b: 0x56 });
});

test('hexToRgb rejects invalid input', () => {
  assert.throws(() => hexToRgb('#fff'), /Invalid hex color/);
  assert.throws(() => hexToRgb('not-a-color'), /Invalid hex color/);
});

test('rgbToHex formats and clamps channels', () => {
  assert.equal(rgbToHex(255, 0, 0), '#ff0000');
  assert.equal(rgbToHex(0, 255, 0), '#00ff00');
  assert.equal(rgbToHex(0, 0, 255), '#0000ff');
  assert.equal(rgbToHex(18, 52, 86), '#123456');
  assert.equal(rgbToHex(-10, 300, 128.6), '#00ff81');
});

test('rgbToHsl converts primary and neutral colors', () => {
  const red = rgbToHsl(255, 0, 0);
  assertClose(red.h, 0);
  assertClose(red.s, 100);
  assertClose(red.l, 50);

  const green = rgbToHsl(0, 255, 0);
  assertClose(green.h, 120);
  assertClose(green.s, 100);
  assertClose(green.l, 50);

  const blue = rgbToHsl(0, 0, 255);
  assertClose(blue.h, 240);
  assertClose(blue.s, 100);
  assertClose(blue.l, 50);

  const gray = rgbToHsl(128, 128, 128);
  assertClose(gray.h, 0);
  assertClose(gray.s, 0);
  assertClose(gray.l, 128 / 255 * 100);
});

test('hslToRgb converts primary and neutral colors', () => {
  assert.deepEqual(hslToRgb(0, 100, 50), { r: 255, g: 0, b: 0 });
  assert.deepEqual(hslToRgb(120, 100, 50), { r: 0, g: 255, b: 0 });
  assert.deepEqual(hslToRgb(240, 100, 50), { r: 0, g: 0, b: 255 });
  assert.deepEqual(hslToRgb(0, 0, 50), { r: 128, g: 128, b: 128 });
});

test('hslToRgb clamps saturation and lightness', () => {
  assert.deepEqual(hslToRgb(0, 200, 150), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hslToRgb(0, -50, -10), { r: 0, g: 0, b: 0 });
});

test('hexToHsl round-trips through rgbToHsl', () => {
  const hsl = hexToHsl('#123456');
  const expected = rgbToHsl(0x12, 0x34, 0x56);
  assertClose(hsl.h, expected.h);
  assertClose(hsl.s, expected.s);
  assertClose(hsl.l, expected.l);
});

test('hslToHex round-trips through hslToRgb', () => {
  const hex = hslToHex(120, 100, 50);
  assert.equal(hex, '#00ff00');
  assert.equal(hslToHex(0, 0, 50), '#808080');
});

test('conversion preserves values across the full color wheel', () => {
  const samples = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 255, g: 255, b: 0 },
    { r: 0, g: 255, b: 255 },
    { r: 255, g: 0, b: 255 },
    { r: 128, g: 64, b: 32 },
  ];

  for (const rgb of samples) {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const back = hslToRgb(hsl.h, hsl.s, hsl.l);
    assert.equal(back.r, rgb.r);
    assert.equal(back.g, rgb.g);
    assert.equal(back.b, rgb.b);
  }
});
