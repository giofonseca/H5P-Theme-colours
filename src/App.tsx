/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import 'h5p-theme-picker';
import Color from 'color';
import { Sparkles, Check, X, Info, AlertTriangle, Copy } from 'lucide-react';

interface ThemeChangeDetail {
  theme: string;
  data: {
    colors: Record<string, string>;
    density: 'large' | 'medium' | 'small';
  };
}

const DEFAULT_FEEDBACK_COLORS = {
  '--h5p-theme-feedback-correct-main': '#256D1D',
  '--h5p-theme-feedback-correct-secondary': '#f3fcf0',
  '--h5p-theme-feedback-correct-third': '#cff1c2',
  '--h5p-theme-feedback-incorrect-main': '#a13236',
  '--h5p-theme-feedback-incorrect-secondary': '#faf0f4',
  '--h5p-theme-feedback-incorrect-third': '#f6dce7',
  '--h5p-theme-feedback-neutral-main': '#E6C81D',
  '--h5p-theme-feedback-neutral-secondary': '#5E4817',
  '--h5p-theme-feedback-neutral-third': '#F0EBCB',
};

export default function App() {
  const pickerRef = useRef<HTMLElement>(null);
  const [themeData, setThemeData] = useState<ThemeChangeDetail | null>(null);
  const [feedbackColors, setFeedbackColors] = useState<Record<string, string>>(DEFAULT_FEEDBACK_COLORS);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    const handleChange = (event: CustomEvent<ThemeChangeDetail>) => {
      console.log('Theme changed:', event.detail);
      setThemeData(event.detail);
    };

    picker.addEventListener('theme-change', handleChange as EventListener);

    // Initial values
    // @ts-ignore - getValues is a method on the custom element
    if (typeof picker.getValues === 'function') {
      // @ts-ignore
      const initialValues = picker.getValues();
      setThemeData(initialValues);
    }

    return () => {
      picker.removeEventListener('theme-change', handleChange as EventListener);
    };
  }, []);

  const copyToClipboard = () => {
    if (!themeData) return;
    const allColors = { ...themeData.data.colors, ...feedbackColors };
    const css = `:root {\n${Object.entries(allColors)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    alert('CSS copied to clipboard!');
  };

  const downloadCss = () => {
    if (!themeData) return;
    const allColors = { ...themeData.data.colors, ...feedbackColors };
    const css = `/* H5P Custom Theme: ${themeData.theme} */\n:root {\n${Object.entries(allColors)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `h5p-theme-${themeData.theme}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const autoMatchToBrand = () => {
    if (!themeData) return;
    
    // Find the primary brand color - using the button color specified by the user
    const brandColorHex = 
      themeData.data.colors['--h5p-theme-main-cta-base'] || 
      themeData.data.colors['--h5p-theme-color-button-main'] || 
      '#000000';
    
    const brandColor = Color(brandColorHex);
    const brandHsl = brandColor.hsl();
    
    const saturation = brandHsl.saturationl();
    const lightness = brandHsl.lightness();

    const generateFeedbackSet = (hue: number) => {
      const main = Color.hsl(hue, saturation, lightness).hex();
      // Secondary is very light, Third is light
      const secondary = Color.hsl(hue, Math.min(saturation, 20), 97).hex();
      const third = Color.hsl(hue, Math.min(saturation, 40), 85).hex();
      return { main, secondary, third };
    };

    // Hues: Green (120), Red (0), Amber (45)
    const correct = generateFeedbackSet(120);
    const incorrect = generateFeedbackSet(0);
    const neutral = generateFeedbackSet(45);

    setFeedbackColors({
      '--h5p-theme-feedback-correct-main': correct.main,
      '--h5p-theme-feedback-correct-secondary': correct.secondary,
      '--h5p-theme-feedback-correct-third': correct.third,
      '--h5p-theme-feedback-incorrect-main': incorrect.main,
      '--h5p-theme-feedback-incorrect-secondary': incorrect.secondary,
      '--h5p-theme-feedback-incorrect-third': incorrect.third,
      '--h5p-theme-feedback-neutral-main': neutral.main,
      '--h5p-theme-feedback-neutral-secondary': neutral.secondary,
      '--h5p-theme-feedback-neutral-third': neutral.third,
    });
  };

  const getContrastRatio = (color1: string, color2: string) => {
    try {
      return Color(color1).contrast(Color(color2));
    } catch (e) {
      return 0;
    }
  };

  const getWCAGStatus = (ratio: number) => {
    if (ratio >= 7) return { label: 'AAA (Pass)', color: 'text-green-600', bg: 'bg-green-50', icon: <Check size={12} /> };
    if (ratio >= 4.5) return { label: 'AA (Pass)', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Check size={12} /> };
    if (ratio >= 3) return { label: 'Large Text Only', color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertTriangle size={12} /> };
    return { label: 'Fail', color: 'text-red-600', bg: 'bg-red-50', icon: <X size={12} /> };
  };

  const suggestBetterColor = (foreground: string, background: string) => {
    try {
      let fg = Color(foreground);
      const bg = Color(background);
      
      if (fg.contrast(bg) >= 4.5) return null;

      // Try adjusting lightness to reach 4.5:1
      const isBgDark = bg.isDark();
      let suggested = fg;
      
      if (isBgDark) {
        // Background is dark, lighten foreground
        while (suggested.contrast(bg) < 4.5 && suggested.lightness() < 100) {
          suggested = suggested.lighten(0.05);
        }
      } else {
        // Background is light, darken foreground
        while (suggested.contrast(bg) < 4.5 && suggested.lightness() > 0) {
          suggested = suggested.darken(0.05);
        }
      }
      
      return suggested.hex();
    } catch (e) {
      return null;
    }
  };

  const handleFeedbackColorChange = (key: string, value: string) => {
    // Remove all # characters and non-hex characters
    let hexPart = value.replace(/[^0-9A-Fa-f]/g, '');
    // Limit to 6 characters for standard hex
    hexPart = hexPart.slice(0, 6);
    
    const sanitized = `#${hexPart.toUpperCase()}`;
    setFeedbackColors(prev => ({ ...prev, [key]: sanitized }));
  };

  const allColors = themeData ? { ...themeData.data.colors, ...feedbackColors } : feedbackColors;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="space-y-4 border-b border-neutral-200 pb-8">
          <h1 className="text-4xl font-light tracking-tight text-neutral-900">
            H5P Theme Picker <span className="italic font-serif">(CSS Generator)</span>
          </h1>
          <p className="text-neutral-500 max-w-2xl">
            A custom element for selecting H5P-style themes and densities. 
            Adjust the settings below to see the real-time updates and generated CSS variables.
          </p>
        </header>

        <main className="grid grid-cols-1 gap-12">
          {/* Picker Section */}
          <section className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400 mb-6">Configuration</h2>
              <div className="theme-picker-container">
                {/* @ts-ignore */}
                <h5p-theme-picker 
                  ref={pickerRef}
                  theme-name="daylight"
                  density="large"
                ></h5p-theme-picker>
              </div>
            </div>

            {/* Feedback Colors Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400">Feedback Colors</h2>
                <button 
                  onClick={autoMatchToBrand}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-wider bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full transition-all border border-blue-100 font-bold"
                >
                  <Sparkles size={12} />
                  Auto-match to Brand
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Correct Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={14} />
                    <h3 className="text-[10px] uppercase tracking-widest font-bold">Correct</h3>
                  </div>
                  {[
                    { id: 'main', label: 'Text/icon' },
                    { id: 'secondary', label: 'Background' },
                    { id: 'third', label: 'Borders' }
                  ].map(({ id, label }) => {
                    const key = `--h5p-theme-feedback-correct-${id}`;
                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-[9px] text-neutral-400 uppercase tracking-tighter block">{label}</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={feedbackColors[key]} 
                            onChange={(e) => handleFeedbackColorChange(key, e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={feedbackColors[key]} 
                            onChange={(e) => handleFeedbackColorChange(key, e.target.value)}
                            className="flex-1 text-[10px] font-mono p-1.5 border border-neutral-100 rounded bg-neutral-50 uppercase"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Incorrect Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <X size={14} />
                    <h3 className="text-[10px] uppercase tracking-widest font-bold">Incorrect</h3>
                  </div>
                  {[
                    { id: 'main', label: 'Text/icon' },
                    { id: 'secondary', label: 'Background' },
                    { id: 'third', label: 'Borders' }
                  ].map(({ id, label }) => {
                    const key = `--h5p-theme-feedback-incorrect-${id}`;
                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-[9px] text-neutral-400 uppercase tracking-tighter block">{label}</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={feedbackColors[key]} 
                            onChange={(e) => handleFeedbackColorChange(key, e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={feedbackColors[key]} 
                            onChange={(e) => handleFeedbackColorChange(key, e.target.value)}
                            className="flex-1 text-[10px] font-mono p-1.5 border border-neutral-100 rounded bg-neutral-50 uppercase"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Neutral Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Info size={14} />
                    <h3 className="text-[10px] uppercase tracking-widest font-bold">Neutral</h3>
                  </div>
                  {[
                    { id: 'main', label: 'Text/icon' },
                    { id: 'secondary', label: 'Background' },
                    { id: 'third', label: 'Borders' }
                  ].map(({ id, label }) => {
                    const key = `--h5p-theme-feedback-neutral-${id}`;
                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-[9px] text-neutral-400 uppercase tracking-tighter block">{label}</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={feedbackColors[key]} 
                            onChange={(e) => handleFeedbackColorChange(key, e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={feedbackColors[key]} 
                            onChange={(e) => handleFeedbackColorChange(key, e.target.value)}
                            className="flex-1 text-[10px] font-mono p-1.5 border border-neutral-100 rounded bg-neutral-50 uppercase"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Accessibility Check Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-400">Accessibility Check (WCAG 2.0)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Correct', prefix: 'correct', color: 'text-green-600' },
                  { name: 'Incorrect', prefix: 'incorrect', color: 'text-red-600' },
                  { name: 'Neutral', prefix: 'neutral', color: 'text-amber-600' }
                ].map((type) => {
                  const fgKey = `--h5p-theme-feedback-${type.prefix}-main`;
                  const bgKey = `--h5p-theme-feedback-${type.prefix}-secondary`;
                  const fg = feedbackColors[fgKey];
                  const bg = feedbackColors[bgKey];
                  const ratio = getContrastRatio(fg, bg);
                  const status = getWCAGStatus(ratio);
                  const suggestion = suggestBetterColor(fg, bg);

                  return (
                    <div key={type.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-[10px] uppercase tracking-widest font-bold ${type.color}`}>{type.name}</h3>
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
                                onClick={() => {
                                  handleFeedbackColorChange(fgKey, suggestion);
                                }}
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
          </section>

          {/* Results Section */}
          <section className="space-y-6">
            <div className="bg-neutral-900 text-neutral-100 p-8 rounded-3xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <div className={`w-3 h-3 rounded-full ${themeData ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-neutral-700'}`}></div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-500">Moodle CSS Output</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="text-[10px] uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full transition-colors border border-neutral-700"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={downloadCss}
                    className="text-[10px] uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full transition-colors border border-neutral-700"
                  >
                    Download
                  </button>
                </div>
              </div>
              
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
                    <div className="bg-black/30 rounded-xl p-4 font-mono text-[10px] leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                      <span className="text-purple-400">:root</span> {'{'}
                      {Object.entries(allColors).map(([key, value]) => {
                        const val = value as string;
                        return (
                          <div key={key} className="pl-4 flex items-center gap-3 py-0.5 group">
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
        </main>

        <footer className="pt-12 border-t border-neutral-200 text-center space-y-4">
          <p className="text-[10px] text-neutral-500 leading-relaxed max-w-3xl mx-auto">
            H5P is a registered <a href="https://h5p.org/trademark" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">trademark</a> of H5P Group. 
            This website was created by <a href="https://giovanni-fonseca.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Giovanni Fonseca</a> who is not affiliated with or endorsed by <a href="https://h5p.group/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">H5P Group</a>. 
            The creation of this web app was facilitated by Google AI Studio and based on the <a href="https://github.com/otacke/h5p-theme-picker" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">H5P Theme Picker</a> by <a href="https://snordian.de/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Oliver Tacke</a> and its code is opened <a href="https://github.com/giofonseca/H5P-Theme4Moodle" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">here</a> to be audited by everyone.
          </p>
          <p className="text-[9px] text-neutral-400 uppercase tracking-widest">
            Built with h5p-theme-picker & React
          </p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        
        /* Fix for potential spillover from h5p-theme-picker as it doesn't use Shadow DOM */
        h5p-theme-picker select {
          @apply w-full p-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all;
        }
        h5p-theme-picker label {
          @apply block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2;
        }
      `}</style>
    </div>
  );
}

