/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React from 'react';
import { Palette } from 'lucide-react';

interface SecondaryAlternativePanelProps {
  allColors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
  onAutoDerive: (type: 'secondary' | 'alternative') => void;
}

/**
 * SecondaryAlternativePanel Component
 * Manages derived colors for secondary CTA and alternative themes.
 */
export const SecondaryAlternativePanel: React.FC<SecondaryAlternativePanelProps> = ({
  allColors,
  onColorChange,
  onAutoDerive
}) => {
  const secondaryKeys = [
    { key: '--h5p-theme-secondary-cta-base', label: 'Base' },
    { key: '--h5p-theme-secondary-cta-light', label: 'Light (+5%)' },
    { key: '--h5p-theme-secondary-cta-dark', label: 'Dark (-5%)' },
    { key: '--h5p-theme-secondary-contrast-cta', label: 'Contrast (20%/79%)' },
    { key: '--h5p-theme-secondary-contrast-cta-hover', label: 'Contrast Hover (99%)' },
  ];

  const alternativeKeys = [
    { key: '--h5p-theme-alternative-base', label: 'Base' },
    { key: '--h5p-theme-alternative-light', label: 'Light (+5%)' },
    { key: '--h5p-theme-alternative-dark', label: 'Dark (-5%)' },
    { key: '--h5p-theme-alternative-darker', label: 'Darker (-8%)' },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400">Secondary & Alternative Themes</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Secondary CTA Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Secondary CTA</h3>
            <button 
              onClick={() => onAutoDerive('secondary')}
              className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tight"
            >
              <Palette size={10} />
              Auto-Derive
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {secondaryKeys.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between group">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-neutral-700 block">{label}</label>
                  <code className="text-[8px] text-neutral-400 font-mono">{key}</code>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={allColors[key] || '#000000'} 
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-20 p-1.5 text-[10px] font-mono text-center rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="relative w-8 h-8 rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                    <input 
                      type="color" 
                      value={allColors[key] || '#000000'} 
                      onChange={(e) => onColorChange(key, e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer scale-150"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Alternative Theme</h3>
            <button 
              onClick={() => onAutoDerive('alternative')}
              className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tight"
            >
              <Palette size={10} />
              Auto-Derive
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {alternativeKeys.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between group">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-neutral-700 block">{label}</label>
                  <code className="text-[8px] text-neutral-400 font-mono">{key}</code>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={allColors[key] || '#000000'} 
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-20 p-1.5 text-[10px] font-mono text-center rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="relative w-8 h-8 rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                    <input 
                      type="color" 
                      value={allColors[key] || '#000000'} 
                      onChange={(e) => onColorChange(key, e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer scale-150"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-[10px] text-amber-700 leading-relaxed">
          <strong>Note:</strong> These variables are derived from their respective base colors. 
          Use the "Auto-Derive" buttons to apply the standard lightness adjustments (±5%, ±8%) 
          and contrast rules defined for the H5P theme.
        </p>
      </div>
    </div>
  );
};
