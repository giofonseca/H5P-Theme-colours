/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import 'h5p-theme-picker';
import Color from 'color';

// Types & Constants
import { ThemeChangeDetail } from './types';
import { DEFAULT_FEEDBACK_COLORS } from './constants';

// Utils
import { sanitizeHex, generateFeedbackSet } from './lib/colorUtils';

// Components
import { Header } from './components/Header';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { FeedbackColorsPanel } from './components/FeedbackColorsPanel';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { Footer } from './components/Footer';

export default function App() {
  const pickerRef = useRef<HTMLElement>(null);
  const [themeData, setThemeData] = useState<ThemeChangeDetail | null>(null);
  const [feedbackColors, setFeedbackColors] = useState<Record<string, string>>(DEFAULT_FEEDBACK_COLORS);
  const [copied, setCopied] = useState(false);

  // Initialize theme picker listener
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    const handleChange = (event: CustomEvent<ThemeChangeDetail>) => {
      setThemeData(event.detail);
    };

    picker.addEventListener('theme-change', handleChange as EventListener);

    // Initial values if already loaded
    // @ts-ignore - getValues is a method on the custom element
    if (typeof picker.getValues === 'function') {
      // @ts-ignore
      setThemeData(picker.getValues());
    }

    return () => {
      picker.removeEventListener('theme-change', handleChange as EventListener);
    };
  }, []);

  // Memoized derived data
  const allColors = useMemo(() => ({
    ...(themeData?.data.colors || {}),
    ...feedbackColors
  }), [themeData, feedbackColors]);

  // Handlers
  const handleFeedbackColorChange = useCallback((key: string, value: string) => {
    const sanitized = sanitizeHex(value);
    setFeedbackColors(prev => ({ ...prev, [key]: sanitized }));
  }, []);

  const autoMatchToBrand = useCallback(() => {
    if (!themeData) return;
    
    const brandColorHex = 
      themeData.data.colors['--h5p-theme-main-cta-base'] || 
      themeData.data.colors['--h5p-theme-color-button-main'] || 
      '#000000';
    
    const brandColor = Color(brandColorHex);
    const brandHsl = brandColor.hsl();
    const saturation = brandHsl.saturationl();
    const lightness = brandHsl.lightness();

    const correct = generateFeedbackSet(120, saturation, lightness);
    const incorrect = generateFeedbackSet(0, saturation, lightness);
    const neutral = generateFeedbackSet(45, saturation, lightness);

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
  }, [themeData]);

  const copyToClipboard = useCallback(() => {
    const css = `:root {\n${Object.entries(allColors)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [allColors]);

  const downloadCss = useCallback(() => {
    if (!themeData) return;
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
  }, [allColors, themeData]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        <Header />

        <main className="grid grid-cols-1 gap-12">
          <section className="space-y-6">
            <ConfigurationPanel ref={pickerRef} />
            
            <FeedbackColorsPanel 
              feedbackColors={feedbackColors} 
              onColorChange={handleFeedbackColorChange}
              onAutoMatch={autoMatchToBrand}
            />

            <AccessibilityPanel 
              feedbackColors={feedbackColors}
              onColorChange={handleFeedbackColorChange}
            />
          </section>

          <ResultsPanel 
            themeData={themeData}
            allColors={allColors}
            onCopy={copyToClipboard}
            onDownload={downloadCss}
            isCopied={copied}
          />
        </main>

        <Footer />
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
