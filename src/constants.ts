/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
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
};

export const FEEDBACK_TYPES = [
  { name: 'Correct', prefix: 'correct', color: 'text-green-600', icon: 'Check' },
  { name: 'Incorrect', prefix: 'incorrect', color: 'text-red-600', icon: 'X' },
  { name: 'Neutral', prefix: 'neutral', color: 'text-amber-600', icon: 'Info' }
] as const;

export const FEEDBACK_FIELDS = [
  { id: 'main', label: 'Text/icon' },
  { id: 'secondary', label: 'Background' },
  { id: 'third', label: 'Borders' }
] as const;
