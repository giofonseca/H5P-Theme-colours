/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="space-y-4 border-b border-neutral-200 pb-8">
      <h1 className="text-4xl font-light tracking-tight text-neutral-900">
        H5P Theme Picker <span className="italic font-serif">(CSS Generator)</span>
      </h1>
      <p className="text-neutral-500 max-w-2xl">
        A custom element for selecting H5P-style themes and densities. 
        Adjust the settings below to see the real-time updates and generated CSS variables.
      </p>
    </header>
  );
};
