/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Color from 'color';

export const getContrastRatio = (color1: string, color2: string): number => {
  try {
    return Color(color1).contrast(Color(color2));
  } catch (e) {
    return 0;
  }
};

export const suggestBetterColor = (foreground: string, background: string): string | null => {
  try {
    let fg = Color(foreground);
    const bg = Color(background);
    
    if (fg.contrast(bg) >= 4.5) return null;

    // Try adjusting lightness to reach 4.5:1
    const isBgDark = bg.isDark();
    let suggested = fg;
    
    if (isBgDark) {
      // Background is dark, lighten foreground
      while (suggested.contrast(bg) < 4.5 && suggested.lightness() < 100) {
        suggested = suggested.lighten(0.05);
      }
    } else {
      // Background is light, darken foreground
      while (suggested.contrast(bg) < 4.5 && suggested.lightness() > 0) {
        suggested = suggested.darken(0.05);
      }
    }
    
    return suggested.hex();
  } catch (e) {
    return null;
  }
};

export const generateFeedbackSet = (hue: number, saturation: number, lightness: number) => {
  const main = Color.hsl(hue, saturation, lightness).hex();
  // Secondary is very light, Third is light
  const secondary = Color.hsl(hue, Math.min(saturation, 20), 97).hex();
  const third = Color.hsl(hue, Math.min(saturation, 40), 85).hex();
  return { main, secondary, third };
};

export const sanitizeHex = (value: string): string => {
  // Remove all # characters and non-hex characters
  let hexPart = value.replace(/[^0-9A-Fa-f]/g, '');
  // Limit to 6 characters for standard hex
  hexPart = hexPart.slice(0, 6);
  return `#${hexPart.toUpperCase()}`;
};
