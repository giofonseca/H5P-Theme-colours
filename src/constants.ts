/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

/**
 * Application Constants
 * Defines default values and configuration for feedback colors and types.
 */

/**
 * Default CSS variables for feedback states (Correct, Incorrect, Neutral).
 */
export const DEFAULT_FEEDBACK_COLORS = {
  '--h5p-theme-feedback-correct-main': '#256D1D',
  '--h5p-theme-feedback-correct-secondary': '#f3fcf0',
  '--h5p-theme-feedback-correct-third': '#cff1c2',
  '--h5p-theme-feedback-incorrect-main': '#a13236',
  '--h5p-theme-feedback-incorrect-secondary': '#faf0f4',
  '--h5p-theme-feedback-incorrect-third': '#f6dce7',
  '--h5p-theme-feedback-neutral-main': '#E6C81D',
  '--h5p-theme-feedback-neutral-secondary': '#5E4817',
  '--h5p-theme-feedback-neutral-third': '#F0EBCB',
  '--h5p-theme-main-cta-base': '#176ee1',
  '--h5p-theme-contrast-cta': '#ffffff',
  '--h5p-theme-secondary-cta-base': '#d1d1d1',
  '--h5p-theme-secondary-contrast-cta': '#333333',
  // PATCH: H5P Bug Workaround
  // Some H5P components expect --color-base instead of --h5p-theme-main-cta-base.
  '--color-base': '#176ee1',
};

/**
 * Configuration for the three feedback types.
 */
export const FEEDBACK_TYPES = [
  { name: 'Correct', prefix: 'correct', color: 'text-green-600', icon: 'Check' },
  { name: 'Incorrect', prefix: 'incorrect', color: 'text-red-600', icon: 'X' },
  { name: 'Neutral', prefix: 'neutral', color: 'text-amber-600', icon: 'Info' }
] as const;

/**
 * The specific color fields within each feedback type.
 * Each feedback type (Correct, Incorrect, Neutral) has three associated variables:
 * - main: The primary text or icon color.
 * - secondary: The light background color.
 * - third: The border or secondary background color.
 */
export const FEEDBACK_FIELDS = [
  { id: 'main', label: 'Text/icon' },
  { id: 'secondary', label: 'Background' },
  { id: 'third', label: 'Borders' }
] as const;
