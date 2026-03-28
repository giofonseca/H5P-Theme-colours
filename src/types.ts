/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React from 'react';

/**
 * ThemeChangeDetail Interface
 * 
 * Represents the structure of the 'theme-change' event detail 
 * emitted by the h5p-theme-picker custom element.
 */
export interface ThemeChangeDetail {
  theme: string; // The name of the selected theme (e.g., 'daylight')
  data: {
    colors: Record<string, string>; // All CSS color variables for the theme
    density: 'large' | 'medium' | 'small'; // The selected UI density
  };
}

/**
 * FeedbackColors Interface
 * 
 * A simple dictionary mapping CSS variable names to their hex color values.
 */
export interface FeedbackColors {
  [key: string]: string;
}

/**
 * WCAGStatus Interface
 * 
 * Represents the visual and textual status of a WCAG contrast check.
 */
export interface WCAGStatus {
  label: string; // e.g., 'AA (Pass)'
  color: string; // Tailwind text color class
  bg: string;    // Tailwind background color class
  icon: React.ReactNode; // Lucide icon component
}
