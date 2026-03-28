/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
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
  // Reference to the h5p-theme-picker custom element
  const pickerRef = useRef<HTMLElement>(null);
  
  // State to store the current theme configuration received from the picker
  // This includes the theme name, density, and all CSS color variables.
  const [themeData, setThemeData] = useState<ThemeChangeDetail | null>(null);
  
  // State to store local overrides for feedback-related CSS variables
  // These are merged with the picker's colors to create the final theme.
  const [feedbackColors, setFeedbackColors] = useState<Record<string, string>>(DEFAULT_FEEDBACK_COLORS);
  
  // State to manage visual feedback for the "Copy to Clipboard" action
  // Used to toggle the button text from "Copy" to "Copied!".
  const [copied, setCopied] = useState(false);

  /**
   * Effect: Initialize the theme picker listener.
   * Listens for 'theme-change' events from the custom element and updates local state.
   * This is now a ONE-WAY synchronization: we only receive data from the picker.
   */
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    const handleChange = (event: CustomEvent<ThemeChangeDetail>) => {
      const data = event.detail;
      setThemeData(data);

      // PATCH: H5P Bug Workaround
      // Some H5P components expect --color-base instead of --h5p-theme-main-cta-base.
      // This ensures the root variable is updated when the picker changes.
      const mainCta = data.data.colors['--h5p-theme-main-cta-base'];
      if (mainCta) {
        document.documentElement.style.setProperty('--color-base', mainCta);
      }
    };

    picker.addEventListener('theme-change', handleChange as EventListener);

    // Initial values if already loaded
    // Some custom elements might already have values if they were initialized before the listener.
    // @ts-ignore - getValues is a method on the custom element
    if (typeof picker.getValues === 'function') {
      // @ts-ignore
      const initialData = picker.getValues();
      setThemeData(initialData);

      // PATCH: H5P Bug Workaround
      // Ensure --color-base is set on mount if the picker already has values.
      const mainCta = initialData.data.colors['--h5p-theme-main-cta-base'];
      if (mainCta) {
        document.documentElement.style.setProperty('--color-base', mainCta);
      }
    }

    return () => {
      picker.removeEventListener('theme-change', handleChange as EventListener);
    };
  }, []); // Only run once on mount

  /**
   * Memoized derived data: allColors
   * Combines colors from the picker's themeData and local feedbackColors overrides.
   * This is the source of truth for the final CSS generation.
   */
  const allColors = useMemo(() => {
    const colors = {
      ...(themeData?.data.colors || {}),
      ...feedbackColors
    };

    // PATCH: H5P Bug Workaround
    // Some H5P components expect --color-base instead of --h5p-theme-main-cta-base.
    // This is a temporary patch that can be removed once H5P is updated.
    if (colors['--h5p-theme-main-cta-base']) {
      colors['--color-base'] = colors['--h5p-theme-main-cta-base'];
    }

    return colors;
  }, [themeData, feedbackColors]);

  /**
   * Handler: handleFeedbackColorChange
   * 
   * Updates local state and document root CSS variables.
   * Synchronization back to the h5p-theme-picker has been REMOVED to prevent 
   * dependency issues and unexpected resets.
   * 
   * @param key - The CSS variable name (e.g., '--h5p-theme-main-cta-base')
   * @param value - The new hex color value
   */
  const handleFeedbackColorChange = useCallback((key: string, value: string) => {
    const sanitized = sanitizeHex(value);
    
    // 1. Update local feedbackColors state immediately for instant UI feedback in panels
    setFeedbackColors(prev => {
      const next = { ...prev, [key]: sanitized };
      
      // PATCH: H5P Bug Workaround
      // Ensure --color-base always matches --h5p-theme-main-cta-base
      if (key === '--h5p-theme-main-cta-base') {
        next['--color-base'] = sanitized;
      }
      
      return next;
    });
    
    // 2. Apply to document root for global availability
    document.documentElement.style.setProperty(key, sanitized);

    // PATCH: H5P Bug Workaround
    if (key === '--h5p-theme-main-cta-base') {
      document.documentElement.style.setProperty('--color-base', sanitized);
    }
  }, []);

  /**
   * Effect: Sync feedbackColors with themeData.
   * 
   * This effect monitors changes in themeData (from the picker).
   * If a color that was previously a local override in feedbackColors is now 
   * present in themeData, we remove it from feedbackColors.
   * This ensures that the picker's state eventually becomes the source of truth 
   * for those variables, preventing redundant state management.
   */
  useEffect(() => {
    if (themeData?.data?.colors) {
      setFeedbackColors(prev => {
        const next = { ...prev };
        let changed = false;
        
        Object.keys(themeData.data.colors).forEach(key => {
          if (key in next) {
            delete next[key];
            changed = true;
          }
        });
        
        return changed ? next : prev;
      });
    }
  }, [themeData]);

  /**
   * Handler: autoMatchToBrand
   * 
   * Generates a complete set of harmonious feedback colors (Correct, Incorrect, Neutral)
   * based on the current brand color's HSL profile.
   * 
   * This ensures that feedback states feel like an integrated part of the theme 
   * rather than arbitrary colors.
   * 
   * Synchronization back to the h5p-theme-picker has been REMOVED to prevent 
   * state loops and unexpected resets.
   */
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

    const newColors = {
      '--h5p-theme-feedback-correct-main': correct.main,
      '--h5p-theme-feedback-correct-secondary': correct.secondary,
      '--h5p-theme-feedback-correct-third': correct.third,
      '--h5p-theme-feedback-incorrect-main': incorrect.main,
      '--h5p-theme-feedback-incorrect-secondary': incorrect.secondary,
      '--h5p-theme-feedback-incorrect-third': incorrect.third,
      '--h5p-theme-feedback-neutral-main': neutral.main,
      '--h5p-theme-feedback-neutral-secondary': neutral.secondary,
      '--h5p-theme-feedback-neutral-third': neutral.third,
    };

    // Apply each generated color to the local state only.
    Object.entries(newColors).forEach(([key, value]) => {
      handleFeedbackColorChange(key, value);
    });
  }, [themeData, handleFeedbackColorChange]);

  /**
   * Handler: copyToClipboard
   * Formats the current color variables into a CSS :root block and copies it to the clipboard.
   */
  const copyToClipboard = useCallback(() => {
    const css = `:root {\n${Object.entries(allColors)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [allColors]);

  /**
   * Handler: downloadCss
   * Generates a .css file containing the theme variables and triggers a download.
   */
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
            <ConfigurationPanel 
              ref={pickerRef} 
            />
            
            <FeedbackColorsPanel 
              feedbackColors={allColors} 
              onColorChange={(key, val) => handleFeedbackColorChange(key, val)}
              onAutoMatch={autoMatchToBrand}
            />
 
            <AccessibilityPanel 
              allColors={allColors}
              onColorChange={(key, val) => handleFeedbackColorChange(key, val)}
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
    </div>
  );
}
