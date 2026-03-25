/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ThemeChangeDetail {
  theme: string;
  data: {
    colors: Record<string, string>;
    density: 'large' | 'medium' | 'small';
  };
}

export interface FeedbackColors {
  [key: string]: string;
}

export interface WCAGStatus {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}
