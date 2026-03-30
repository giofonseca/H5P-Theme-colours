/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React from 'react';
import { ThemeChangeDetail } from '../types';

interface ResultsPanelProps {
  /** The current theme configuration received from the picker */
  themeData: ThemeChangeDetail | null;
  /** Dictionary of all current CSS variables and their hex values */
  allColors: Record<string, string>;
  /** Callback to copy the CSS to the clipboard */
  onCopy: () => void;
  /** Callback to download the CSS as a file */
  onDownload: () => void;
  /** Optional flag to show "Copied!" state on the button */
  isCopied?: boolean;
}

/**
 * ResultsPanel Component
 * 
 * Displays the generated CSS variables in a code block.
 * Provides functionality to copy the CSS to the clipboard or download it as a file.
 * Includes instructions for Moodle administrators on how to apply the CSS.
 * 
 * @param {ResultsPanelProps} props - The component props.
 */
export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  themeData,
  allColors,
  onCopy,
  onDownload,
  isCopied
}) => {
  return (
    <section className="space-y-6">
      <div className="bg-neutral-900 text-neutral-100 p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <div className={`w-3 h-3 rounded-full ${themeData ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-neutral-700'}`}></div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-500">Moodle CSS Output</h2>
          <div className="flex gap-2">
            <button 
              onClick={onCopy}
              className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-all border ${
                isCopied 
                ? 'bg-green-600 border-green-500 text-white' 
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              }`}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={onDownload}
              className="text-[10px] uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full transition-colors border border-neutral-700"
            >
              Download
            </button>
          </div>
        </div>
        
        {/* 
          Conditional Rendering:
          Only show the output once themeData has been received from the picker.
        */}
        {themeData ? (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-neutral-800 pb-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase mb-1">Active Theme</p>
                <p className="text-2xl font-mono text-white capitalize">{themeData.theme}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase mb-1">Density</p>
                <p className="text-lg font-mono text-neutral-300 capitalize">{themeData.data.density}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 
                CSS Variables Display:
                This section iterates through all generated CSS variables (both from the picker 
                and our feedback overrides) and displays them in a formatted code block.
              */}
              <div className="bg-black/30 rounded-xl p-4 font-mono text-[10px] leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                <span className="text-purple-400">:root</span> {'{'}
                {Object.entries(allColors).map(([key, value]) => {
                  const val = value as string;
                  return (
                    <div key={key} className="pl-4 flex items-center gap-3 py-0.5 group">
                      {/* Small color preview box next to each variable */}
                      <div 
                        className="w-2.5 h-2.5 rounded-sm border border-white/20 flex-shrink-0 shadow-sm" 
                        style={{ 
                          backgroundColor: val.includes('color-mix') ? 'transparent' : val,
                          backgroundImage: val.includes('color-mix') ? 'linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444), linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444)' : 'none',
                          backgroundSize: '4px 4px',
                          backgroundPosition: '0 0, 2px 2px'
                        }}
                        title={val}
                      ></div>
                      <div className="flex gap-1">
                        <span className="text-neutral-400 whitespace-nowrap">{key}:</span>
                        <span className="text-blue-400">{val};</span>
                      </div>
                    </div>
                  );
                })}
                {'}'}
              </div>
            </div>

            {/* 
              Moodle Admin Instructions:
              Provides clear, step-by-step guidance for Moodle administrators on how 
              to apply the generated CSS variables to their site.
            */}
            <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2 font-semibold">Moodle Admin Instructions</p>
              <ol className="text-[10px] text-neutral-500 space-y-1 list-decimal pl-4">
                <li>Copy the generated CSS.</li>
                <li>Log in to your Moodle as administrator.</li>
                <li>Paste the CSS into your Moodle theme's <span className="text-neutral-300 italic">"Custom CSS"</span> field (usually found in <span className="text-neutral-300 italic">Site Administration &gt; Appearance &gt; Themes &gt; [Your Theme] &gt; Advanced Settings</span>).</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-neutral-600 italic">
            Waiting for selection...
          </div>
        )}
      </div>
    </section>
  );
};
