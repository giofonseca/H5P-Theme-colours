/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React from 'react';

/**
 * Header Component
 * 
 * Displays the main application title and a brief description.
 * 
 * The design uses a combination of light sans-serif and italic serif fonts 
 * to create a professional, editorial feel.
 */
export const Header: React.FC = () => {
  return (
    <header className="space-y-6 border-b border-neutral-200 pb-10">
      <h1 className="text-5xl font-light tracking-tight text-neutral-900">
        H5P Theme Picker to CSS
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Step 01</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Pick a theme or customise yours under the configuration panel.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Step 02</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Customise feedback colour optionally, normally H5P Group keeps those constant cross themes, but you can try to find more appealing colors based on it.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Step 03</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Check that all colours pass WCAG 2.0 contrast standards to ensure accessibility.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Step 04</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Copy or download the CSS and use it in Moodle for example.
          </p>
        </div>
      </div>
    </header>
  );
};
