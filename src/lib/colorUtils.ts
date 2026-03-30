/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import Color from 'color';

/**
 * Color Utility Functions
 * Provides helper functions for color manipulation, contrast calculation, and accessibility suggestions.
 */

/**
 * Calculates the contrast ratio between two colors using the 'color' library.
 * 
 * WCAG 2.0 uses a formula based on relative luminance to determine contrast.
 * Returns a value between 1 (no contrast) and 21 (maximum contrast).
 * 
 * @param {string} color1 - The first color (hex, rgb, etc.).
 * @param {string} color2 - The second color (hex, rgb, etc.).
 * @returns {number} The contrast ratio. Returns 0 if calculation fails.
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  try {
    return Color(color1).contrast(Color(color2));
  } catch (e) {
    console.error(`[ColorUtils] Failed to calculate contrast: ${color1} vs ${color2}`, e);
    return 0;
  }
};

/**
 * Suggests a more accessible color that meets the WCAG 4.5:1 contrast ratio requirement.
 * 
 * It iteratively adjusts the lightness of the foreground color until the target ratio is met.
 * - If the background is dark, it lightens the foreground.
 * - If the background is light, it darkens the foreground.
 * 
 * This ensures the suggested color remains within the same hue/saturation family as the original.
 * 
 * @param {string} foreground - The foreground color (text).
 * @param {string} background - The background color.
 * @returns {string | null} The suggested hex color, or null if it already meets the standard or fails.
 */
export const suggestBetterColor = (foreground: string, background: string): string | null => {
  try {
    let fg = Color(foreground);
    const bg = Color(background);
    
    // If it already meets the standard, no suggestion needed
    if (fg.contrast(bg) >= 4.5) return null;

    const isBgDark = bg.isDark();
    let suggested = fg;
    
    // Iteratively adjust lightness by 5% increments until contrast is sufficient
    if (isBgDark) {
      // Background is dark, lighten foreground to increase contrast
      while (suggested.contrast(bg) < 4.5 && suggested.lightness() < 100) {
        suggested = suggested.lighten(0.05);
      }
    } else {
      // Background is light, darken foreground to increase contrast
      while (suggested.contrast(bg) < 4.5 && suggested.lightness() > 0) {
        suggested = suggested.darken(0.05);
      }
    }
    
    return suggested.hex();
  } catch (e) {
    console.error(`[ColorUtils] Failed to suggest better color for: ${foreground} on ${background}`, e);
    return null;
  }
};

/**
 * Generates a set of harmonious colors (main, secondary, third) based on HSL values.
 * Used for creating feedback state color sets (Correct, Incorrect, Neutral).
 * 
 * @param {number} hue - The HSL hue (0-360).
 * @param {number} saturation - The HSL saturation (0-100).
 * @param {number} lightness - The HSL lightness (0-100).
 * @returns {Object} An object containing main, secondary, and third hex colors.
 */
export const generateFeedbackSet = (hue: number, saturation: number, lightness: number) => {
  const main = Color.hsl(hue, saturation, lightness).hex();
  // Secondary is very light, Third is light
  const secondary = Color.hsl(hue, Math.min(saturation, 20), 97).hex();
  const third = Color.hsl(hue, Math.min(saturation, 40), 85).hex();
  return { main, secondary, third };
};

/**
 * Sanitizes a hex color string, ensuring it starts with '#' and contains only valid hex characters.
 * 
 * @param {string} value - The raw color string.
 * @returns {string} A sanitized hex string (e.g., "#FFFFFF").
 */
export const sanitizeHex = (value: string): string => {
  // Remove all # characters and non-hex characters
  let hexPart = value.replace(/[^0-9A-Fa-f]/g, '');
  // Limit to 6 characters for standard hex
  hexPart = hexPart.slice(0, 6);
  return `#${hexPart.toUpperCase()}`;
};
