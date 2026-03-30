/**
 * @license
 * SPDX-License-Identifier: CC0-1.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface H5PPreviewPanelProps {
  /** Dictionary of all current CSS variables and their hex values */
  allColors: Record<string, string>;
  /** Optional UI density setting (large, medium, small) */
  density?: string;
}

/**
 * H5PPreviewPanel Component
 * 
 * Allows users to input an H5P embed URL and see a side-by-side comparison
 * of the original content vs. the content with the custom theme applied.
 * 
 * Includes an "Alpha" toggle to enable/disable the live preview feature.
 * 
 * @param {H5PPreviewPanelProps} props - The component props.
 */
export const H5PPreviewPanel: React.FC<H5PPreviewPanelProps> = ({ allColors, density }) => {
  const [url, setUrl] = useState<string>('');
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [themedHtml, setThemedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlphaEnabled, setIsAlphaEnabled] = useState<boolean>(false);

  /**
   * Handler: fetchThemedPreview
   * 
   * Communicates with the backend proxy to fetch the H5P content and inject 
   * the current theme variables.
   * 
   * Why a proxy?
   * 1. CORS Bypass: Browsers block direct fetching of H5P content from other domains.
   * 2. Injection: The server can modify the HTML before it reaches the browser, 
   *    allowing us to inject styles and fix asset paths.
   */
  const fetchThemedPreview = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/proxy-h5p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          cssVariables: allColors,
          density: density,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch themed preview';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          // If not JSON, use the status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // The proxy returns the modified HTML as a string
      const html = await response.text();
      setThemedHtml(html);
      setActiveUrl(targetUrl);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [allColors, density]);

  const handlePreview = () => {
    if (!url) return;
    
    // Basic URL validation
    try {
      new URL(url);
      fetchThemedPreview(url);
    } catch (e) {
      setError('Please enter a valid URL');
    }
  };

  /**
   * Effect: Automatic Live Updates
   * 
   * This effect ensures that the preview stays in sync with your theme changes.
   * Whenever 'allColors' or 'density' changes, we re-fetch the themed preview.
   * 
   * We use a 500ms debounce to prevent spamming the proxy server while 
   * the user is dragging a color picker.
   */
  useEffect(() => {
    if (activeUrl && isAlphaEnabled) {
      const timer = setTimeout(() => {
        fetchThemedPreview(activeUrl);
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [allColors, activeUrl, isAlphaEnabled, fetchThemedPreview]);

  return (
    <section className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-neutral-500 mb-1">H5P Live Preview</h2>
            <p className="text-sm text-neutral-400">Compare your theme against real H5P content.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">ALPHA Live Preview</span>
            <button
              onClick={() => setIsAlphaEnabled(!isAlphaEnabled)}
              className={`w-10 h-5 rounded-full transition-all relative ${isAlphaEnabled ? 'bg-blue-500' : 'bg-neutral-200'}`}
              title={isAlphaEnabled ? "Disable Alpha Preview" : "Enable Alpha Preview"}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isAlphaEnabled ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        {isAlphaEnabled && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste H5P embed URL here (e.g., https://h5p.org/h5p/embed/12345)"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all"
                />
              </div>
              <button
                onClick={handlePreview}
                disabled={isLoading || !url}
                className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                {isLoading ? 'Loading...' : 'Preview'}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl">
                {error}
              </div>
            )}

            {activeUrl && (
              <div className="grid grid-cols-1 gap-12">
                {/* 
                  Original Content:
                  Rendered via a standard iframe. This shows how the content 
                  looks without any customization.
                */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Original Content</span>
                    <span className="text-[10px] text-neutral-300 font-mono truncate max-w-[200px]">{activeUrl}</span>
                  </div>
                  <div className="aspect-video bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner relative">
                    <iframe
                      src={activeUrl}
                      className="w-full h-full border-none"
                      title="Original H5P Content"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* 
                  Themed Content:
                  Rendered via srcDoc using the modified HTML string from the proxy.
                  This shows the content with your custom Moodle CSS variables applied.
                */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500">Themed Preview</span>
                    <span className="text-[10px] text-blue-300 font-mono">Styles Injected</span>
                  </div>
                  <div className="aspect-video bg-neutral-100 rounded-2xl overflow-hidden border border-blue-100 shadow-inner relative ring-2 ring-blue-500/10">
                    {isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <RefreshCw className="animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <iframe
                        srcDoc={themedHtml}
                        className="w-full h-full border-none"
                        title="Themed H5P Content"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {!activeUrl && !isLoading && (
              <div className="border-2 border-dashed border-neutral-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                  <ExternalLink size={24} />
                </div>
                <div className="max-w-xs">
                  <p className="text-sm text-neutral-500 font-medium">No active preview</p>
                  <p className="text-xs text-neutral-400 mt-1">Enter an H5P embed URL above to see how your theme looks on real content.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
