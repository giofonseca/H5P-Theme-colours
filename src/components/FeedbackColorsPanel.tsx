/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React from 'react';
import { Sparkles, Check, X, Info } from 'lucide-react';
import { FEEDBACK_TYPES, FEEDBACK_FIELDS } from '../constants';

interface FeedbackColorsPanelProps {
  /** Dictionary of all current CSS variables and their hex values */
  feedbackColors: Record<string, string>;
  /** Callback triggered when a color is manually updated via input */
  onColorChange: (key: string, value: string) => void;
  /** Callback to trigger the automatic generation of feedback colors based on brand */
  onAutoMatch: () => void;
}

/**
 * FeedbackColorsPanel Component
 * 
 * This panel allows users to manually adjust the colors for different feedback states 
 * (Correct, Incorrect, Neutral). It also provides an "Auto-match to Brand" feature 
 * that automatically generates harmonious feedback colors based on the current brand color.
 * 
 * @param {FeedbackColorsPanelProps} props - The component props.
 */
export const FeedbackColorsPanel: React.FC<FeedbackColorsPanelProps> = ({
  feedbackColors,
  onColorChange,
  onAutoMatch
}) => {
  /**
   * Helper to return the appropriate Lucide icon for a feedback type.
   * 
   * @param {string} iconName - The name of the icon ('Check', 'X', 'Info').
   * @returns {React.ReactNode} The Lucide icon component.
   */
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Check': return <Check size={14} />;
      case 'X': return <X size={14} />;
      case 'Info': return <Info size={14} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400">Feedback Colors</h2>
        {/* 
          Auto-match Button:
          Triggers the generation of feedback colors based on the brand's HSL profile.
          This ensures the feedback states (Correct, Incorrect, Neutral) feel like 
          part of the same design system as the rest of the theme.
        */}
        <button 
          onClick={onAutoMatch}
          className="flex items-center gap-2 text-[10px] uppercase tracking-wider bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full transition-all border border-blue-100 font-bold"
        >
          <Sparkles size={12} />
          Auto-match to Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEEDBACK_TYPES.map((type) => (
          <div key={type.prefix} className="space-y-4">
            <div className={`flex items-center gap-2 ${type.color}`}>
              {getIcon(type.icon)}
              <h3 className="text-[10px] uppercase tracking-widest font-bold">{type.name}</h3>
            </div>
            {FEEDBACK_FIELDS.map(({ id, label }) => {
              const key = `--h5p-theme-feedback-${type.prefix}-${id}`;
              return (
                <div key={key} className="space-y-1">
                  {/* 
                    Color Inputs:
                    Each feedback type has a Main, Secondary, and Third color.
                    Main: The primary color for the state (e.g., solid green).
                    Secondary: A very light background version.
                    Third: A slightly darker background or border version.
                  */}
                  <label className="text-[9px] text-neutral-400 uppercase tracking-tighter block">{label}</label>
                  <div className="flex items-center gap-2">
                    {/* 
                      Native Color Picker Input:
                      Provides a visual way to select colors. 
                      Fallback value ensures it's always a controlled component.
                    */}
                    <input 
                      type="color" 
                      value={feedbackColors[key] || '#000000'} 
                      onChange={(e) => onColorChange(key, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    {/* 
                      Text Input for Hex Values:
                      Allows precise entry of hex codes. 
                      Fallback value ensures it's always a controlled component.
                    */}
                    <input 
                      type="text" 
                      value={feedbackColors[key] || ''} 
                      onChange={(e) => onColorChange(key, e.target.value)}
                      className="flex-1 text-[10px] font-mono p-1.5 border border-neutral-100 rounded bg-neutral-50 uppercase"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
