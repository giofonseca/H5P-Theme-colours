/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React, { forwardRef } from 'react';

interface ConfigurationPanelProps {}

/**
 * ConfigurationPanel Component
 * 
 * Wraps the h5p-theme-picker custom element.
 * 
 * This component acts as a standalone data source. It emits 'theme-change' events 
 * whenever the user interacts with the picker (e.g., changing a theme or color).
 * 
 * IMPORTANT: Synchronization from the React application back to the picker 
 * has been completely removed. This prevents complex state loops where 
 * React updates would trigger picker updates, which in turn would trigger 
 * more React updates, often leading to UI resets or performance issues.
 * 
 * The React application now treats the picker as the primary source of 
 * truth for base theme colors, while maintaining its own local overrides 
 * for feedback-specific variables.
 */
export const ConfigurationPanel = forwardRef<HTMLElement, ConfigurationPanelProps>((props, ref) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
      <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400 mb-6">Configuration</h2>
      <div className="theme-picker-container">
        {/* 
          The h5p-theme-picker custom element.
          
          We use a ref to allow the parent (App.tsx) to attach event listeners 
          and retrieve initial values.
          
          We no longer pass theme-data, theme-name, or density attributes to it. 
          This ensures the picker maintains its own internal state and only 
          notifies the app when that state changes.
        */}
        {/* @ts-ignore */}
        <h5p-theme-picker 
          ref={ref}
        ></h5p-theme-picker>
      </div>
    </div>
  );
});

ConfigurationPanel.displayName = 'ConfigurationPanel';
