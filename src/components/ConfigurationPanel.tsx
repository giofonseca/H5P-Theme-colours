/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React, { forwardRef } from 'react';

interface ConfigurationPanelProps {
  // No props needed for this one, just the ref
}

export const ConfigurationPanel = forwardRef<HTMLElement, ConfigurationPanelProps>((props, ref) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
      <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400 mb-6">Configuration</h2>
      <div className="theme-picker-container">
        {/* @ts-ignore */}
        <h5p-theme-picker 
          ref={ref}
          theme-name="daylight"
          density="large"
        ></h5p-theme-picker>
      </div>
    </div>
  );
});

ConfigurationPanel.displayName = 'ConfigurationPanel';
