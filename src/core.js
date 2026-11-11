
/**
 * Color conversion utilities that avoid rounding errors by keeping
 * calculations in floating point and only rounding at the final step.
 *
 * Hex strings are interpreted as 6-digit RGB (e.g. #ff0000 or ff0000).
 * RGB channels are integers 0-255. HSL hue is in degrees [0, 360),
 * saturation and lightness are percentages [0, 100].
 */

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value);
}

export function hexToRgb(hex) {
  const match = HEX_RE.exec(hex);
  if (!match) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const int = parseInt(match[1], 16);
  return {
    r: (int >> 16) & 0xff,
    g: (int >> 8) & 0xff,
    b: int & 0xff,
  };
}

export function rgbToHex(r, g, b) {
  const ri = round(clamp(r, 0, 255));
  const gi = round(clamp(g, 0, 255));
  const bi = round(clamp(b, 0, 255));
  const hex = ((ri << 16) | (gi << 8) | bi).toString(16).padStart(6, '0');
  return `#${hex}`;
}

export function rgbToHsl(r, g, b) {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = lightness === 0 || lightness === 1
      ? 0
      : (max - lightness) / Math.min(lightness, 1 - lightness);

    switch (max) {
      case rn:
        hue = ((gn - bn) / delta) % 6;
        break;
      case gn:
        hue = (bn - rn) / delta + 2;
        break;
      default:
        hue = (rn - gn) / delta + 4;
        break;
    }

    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }

  return {
    h: hue,
    s: saturation * 100,
    l: lightness * 100,
  };
}

export function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;

  if (saturation === 0) {
    const gray = round(lightness * 255);
    return { r: gray, g: gray, b: gray };
  }

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (hue < 60) {
    rp = chroma;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = chroma;
  } else if (hue < 180) {
    gp = chroma;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = chroma;
  } else if (hue < 300) {
    rp = x;
    bp = chroma;
  } else {
    rp = chroma;
    bp = x;
  }

  return {
    r: round((rp + m) * 255),
    g: round((gp + m) * 255),
    b: round((bp + m) * 255),
  };
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}
