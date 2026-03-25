/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, X, AlertTriangle, Copy } from 'lucide-react';
import { FEEDBACK_TYPES } from '../constants';
import { getContrastRatio, suggestBetterColor } from '../lib/colorUtils';

interface AccessibilityPanelProps {
  allColors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  allColors,
  onColorChange
}) => {
  const getWCAGStatus = (ratio: number) => {
    if (ratio >= 7) return { label: 'AAA (Pass)', color: 'text-green-600', bg: 'bg-green-50', icon: <Check size={12} /> };
    if (ratio >= 4.5) return { label: 'AA (Pass)', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Check size={12} /> };
    if (ratio >= 3) return { label: 'Large Text Only', color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertTriangle size={12} /> };
    return { label: 'Fail', color: 'text-red-600', bg: 'bg-red-50', icon: <X size={12} /> };
  };

  const ctaColors = [
    { key: '--h5p-theme-main-cta-base', name: 'Main CTA' },
    { key: '--h5p-theme-secondary-cta-base', name: 'Secondary CTA' }
  ];

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400">Accessibility Check (WCAG 2.0)</h2>
      </div>

      <div className="space-y-12">
        {/* CTA Colors Section */}
        <div className="space-y-6">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 border-b border-neutral-100 pb-2">Call to Action Colors (vs White)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ctaColors.map((cta) => {
              const fg = allColors[cta.key] || '#000000';
              const bg = '#ffffff'; // Assuming white background for CTAs
              const ratio = getContrastRatio(fg, bg);
              const status = getWCAGStatus(ratio);
              const suggestion = suggestBetterColor(fg, bg);

              return (
                <div key={cta.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-700">{cta.name}</h4>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${status.bg} ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-neutral-400 uppercase">Contrast Ratio</span>
                      <span className="text-xs font-mono font-bold">{ratio.toFixed(2)}:1</span>
                    </div>

                    <div 
                      className="h-12 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner"
                      style={{ backgroundColor: fg, color: bg }}
                    >
                      Button Text
                    </div>

                    {suggestion && (
                      <div className="pt-3 border-t border-neutral-200 space-y-2">
                        <p className="text-[9px] text-red-500 font-medium leading-tight">
                          Warning: This color might be hard to read on light backgrounds.
                        </p>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-neutral-200">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded shadow-sm border border-neutral-100" style={{ backgroundColor: suggestion }}></div>
                            <span className="text-[10px] font-mono text-neutral-600">{suggestion}</span>
                          </div>
                          <button 
                            onClick={() => onColorChange(cta.key, suggestion)}
                            className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tighter"
                            title="Apply suggested color"
                          >
                            <Copy size={10} />
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Colors Section */}
        <div className="space-y-6">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 border-b border-neutral-100 pb-2">Feedback States</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEEDBACK_TYPES.map((type) => {
              const fgKey = `--h5p-theme-feedback-${type.prefix}-main`;
              const bgKey = `--h5p-theme-feedback-${type.prefix}-secondary`;
              const fg = allColors[fgKey];
              const bg = allColors[bgKey];
              const ratio = getContrastRatio(fg, bg);
              const status = getWCAGStatus(ratio);
              const suggestion = suggestBetterColor(fg, bg);

              return (
                <div key={type.name} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-[10px] uppercase tracking-widest font-bold ${type.color}`}>{type.name}</h4>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${status.bg} ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-neutral-400 uppercase">Contrast Ratio</span>
                      <span className="text-xs font-mono font-bold">{ratio.toFixed(2)}:1</span>
                    </div>

                    <div 
                      className="h-12 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner"
                      style={{ backgroundColor: bg, color: fg }}
                    >
                      Sample Text
                    </div>

                    {suggestion && (
                      <div className="pt-3 border-t border-neutral-200 space-y-2">
                        <p className="text-[9px] text-red-500 font-medium leading-tight">
                          Warning: Contrast is too low for standard text.
                        </p>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-neutral-200">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded shadow-sm border border-neutral-100" style={{ backgroundColor: suggestion }}></div>
                            <span className="text-[10px] font-mono text-neutral-600">{suggestion}</span>
                          </div>
                          <button 
                            onClick={() => onColorChange(fgKey, suggestion)}
                            className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tighter"
                            title="Apply suggested color"
                          >
                            <Copy size={10} />
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
