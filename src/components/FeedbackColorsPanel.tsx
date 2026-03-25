/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Check, X, Info } from 'lucide-react';
import { FEEDBACK_TYPES, FEEDBACK_FIELDS } from '../constants';

interface FeedbackColorsPanelProps {
  feedbackColors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
  onAutoMatch: () => void;
}

export const FeedbackColorsPanel: React.FC<FeedbackColorsPanelProps> = ({
  feedbackColors,
  onColorChange,
  onAutoMatch
}) => {
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
                  <label className="text-[9px] text-neutral-400 uppercase tracking-tighter block">{label}</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={feedbackColors[key]} 
                      onChange={(e) => onColorChange(key, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={feedbackColors[key]} 
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
