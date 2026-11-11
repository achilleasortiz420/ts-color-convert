# ts-color-convert

A small, dependency-free TypeScript/JavaScript library for converting between hex, RGB, and HSL color values while keeping rounding errors out of the result.

```js
import { hexToRgb, rgbToHsl, hslToHex } from 'ts-color-convert';

const rgb = hexToRgb('#3498db');
// { r: 52, g: 152, b: 219 }

const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
// { h: 204.17910447761193, s: 67.88359788359787, l: 53.13725490196079 }

const hex = hslToHex(hsl.h, hsl.s, hsl.l);
// '#3498db'
```

The exported names are `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `hexToHsl`, and `hslToHex`.

## Why this exists

Color conversions are usually written with integer arithmetic and early rounding. That is fine for one step, but chaining conversions (hex to HSL, adjust lightness, back to hex) accumulates error, so a color can drift by a channel value or two after a round trip.

This library keeps every intermediate value in floating point and only rounds when producing the final RGB or hex output. The trade-off is that `rgbToHsl` returns fractional hue, saturation, and lightness values rather than tidy integers. That is intentional: the extra precision is what makes round trips stable.

## The awkward edge

Hex parsing accepts exactly six hexadecimal digits, with or without a leading `#`. It does not accept three-digit shorthand (`#abc`), nor does it accept alpha (`#rrggbbaa`). Passing anything else throws an `Error`. If you need shorthand or alpha, expand or strip it before calling `hexToRgb`.

RGB channels are clamped to `[0, 255]`; HSL hue wraps modulo 360, and saturation and lightness are clamped to `[0, 100]`.
