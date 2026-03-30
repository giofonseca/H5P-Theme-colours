import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  /**
   * API Route: /api/proxy-h5p
   * 
   * This route acts as a specialized proxy for H5P content.
   * It solves several critical challenges when trying to preview themed H5P content:
   * 
   * 1. CORS Bypass: Fetches content from external H5P hosts that would otherwise block client-side access.
   * 2. Asset Normalization: Rewrites relative URLs (src, href, url()) to absolute paths so fonts/scripts load correctly.
   * 3. Style Injection: Merges custom Moodle CSS variables into the H5P content without breaking original styles.
   * 4. Modern H5P Compatibility: Injects necessary classes and scripts for the H5P 3.0 "Modern" look and feel.
   * 
   * SECURITY NOTE: This route includes SSRF and XSS mitigations.
   * 
   * @param {string} req.body.url - The H5P embed URL to proxy.
   * @param {Object} req.body.cssVariables - Dictionary of CSS variables to inject.
   * @param {string} req.body.density - UI density setting (large, medium, small).
   */
  app.post("/api/proxy-h5p", async (req, res) => {
    const { url, cssVariables, density } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // SSRF MITIGATION: Validate URL format and protocol
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return res.status(400).json({ error: "Invalid protocol. Only http and https are allowed." });
      }
      
      // Block common internal/private IP ranges and localhost
      const hostname = urlObj.hostname.toLowerCase();
      const privateRanges = [
        "localhost", "127.0.0.1", "0.0.0.0", "::1",
        "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.",
        "192.168.", "169.254."
      ];
      
      if (privateRanges.some(range => hostname === range || hostname.startsWith(range))) {
        return res.status(403).json({ error: "Access to internal or private addresses is forbidden." });
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL format." });
    }

    // XSS MITIGATION: Sanitize CSS variables
    const sanitizeCssValue = (val: string) => {
      if (typeof val !== 'string') return '';
      // Allow alphanumeric, hex, common CSS units, spaces, and dashes
      // Block characters that could be used for injection like <, >, ", ', ;, (, )
      return val.replace(/[^a-zA-Z0-9#.,\s\-%]/g, '');
    };

    const sanitizedVars: Record<string, string> = {};
    if (cssVariables && typeof cssVariables === 'object') {
      Object.entries(cssVariables).forEach(([key, value]) => {
        // Sanitize key (must start with -- and be alphanumeric/dash)
        const safeKey = key.replace(/[^a-zA-Z0-9\-]/g, '');
        if (safeKey.startsWith('--')) {
          sanitizedVars[safeKey] = sanitizeCssValue(String(value));
        }
      });
    }

    console.log(`[Proxy] Fetching H5P content from: ${url}`);

    try {
      // Fetch the original H5P content
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000, // 10s timeout for production stability
      });

      let html = response.data;
      
      // Calculate base URLs for path normalization
      const urlObj = new URL(url);
      const origin = urlObj.origin;
      const pathParts = urlObj.pathname.split('/');
      pathParts.pop();
      const baseUrl = origin + pathParts.join('/') + '/';

      /**
       * SOLUTION: Deep URL Rewriting (Moodle & WordPress Compatible)
       * 
       * Moodle uses complex relative paths (e.g., ../../lib/h5p/...) and 
       * often relies on RequireJS for script loading.
       */
      const toAbsolute = (path: string) => {
        if (!path || path.startsWith('//') || path.startsWith('http') || path.startsWith('data:')) return path;
        
        // Handle Moodle's root-relative paths
        if (path.startsWith('/')) return `${origin}${path}`;
        
        // Handle standard relative paths
        try {
          return new URL(path, baseUrl).href;
        } catch (e) {
          return `${baseUrl}${path}`;
        }
      };

      // Rewrite src="..." and href="..." attributes
      html = html.replace(/(src|href)="([^"]+)"/g, (match, attr, path) => {
        return `${attr}="${toAbsolute(path)}"`;
      });

      // Rewrite url('...') patterns in style tags and inline styles
      html = html.replace(/url\(['"]?([^'"]+)['"]?\)/g, (match, path) => {
        return `url("${toAbsolute(path)}")`;
      });

      // MOODLE FIX: Rewrite RequireJS config if present
      html = html.replace(/baseUrl\s*:\s*['"]([^'"]+)['"]/g, (match, path) => {
        return `baseUrl: "${toAbsolute(path)}"`;
      });

      /**
       * MOD_HVP & MOODLE INTEGRATION FIX:
       * mod_hvp and core H5P in Moodle inject a global H5PIntegration object.
       * We must absolute-ify paths inside this object without breaking the JSON.
       */
      
      // 1. Fix single string paths (path, librariesPath, etc.)
      html = html.replace(/"(path|librariesPath|url|baseUrl)"\s*:\s*"([^"]+)"/g, (match, key, path) => {
        const cleanPath = path.replace(/\\\//g, '/');
        if (cleanPath.startsWith('http') || cleanPath.startsWith('data:') || cleanPath.startsWith('//')) return match;
        const absolutePath = toAbsolute(cleanPath).replace(/\//g, '\\/');
        return `"${key}": "${absolutePath}"`;
      });

      // 2. Fix arrays of paths (scripts, styles)
      // We target the arrays specifically to avoid greedy matching issues
      const fixPathArray = (match: string, key: string, list: string) => {
        const fixedList = list.replace(/"([^"]+)"/g, (m, p) => {
          const cleanPath = p.replace(/\\\//g, '/');
          if (cleanPath.startsWith('http') || cleanPath.startsWith('data:') || cleanPath.startsWith('//')) return m;
          return `"${toAbsolute(cleanPath).replace(/\//g, '\\/')}"`;
        });
        return `"${key}": [${fixedList}]`;
      };

      html = html.replace(/"(scripts|styles)"\s*:\s*\[([^\]]+)\]/g, fixPathArray);

      /**
       * SOLUTION: Themed Style Injection (Aggressive & Modern Compatible)
       */
      const styleBlock = `
        <style id="h5p-theme-overrides">
          :root, html, body {
            ${Object.entries(sanitizedVars)
              .map(([key, value]) => `${key}: ${value} !important;`)
              .join("\n            ")}
          }
          
          /* Force variables onto all H5P elements and containers */
          .h5p-content, .h5p-iframe, .h5p-container, .h5p-wrapper, .h5p-content-wrapper, [class*="h5p-"] {
            ${Object.entries(sanitizedVars)
              .map(([key, value]) => `${key}: ${value} !important;`)
              .join("\n            ")}
          }

          /* H5P 3.0 "Modern" Look & Feel Compatibility */
          .h5p-modern, .h5p-content.h5p-modern {
            --h5p-color-primary: var(--h5p-primary-color) !important;
            --h5p-color-primary-dark: var(--h5p-primary-color-dark) !important;
            --h5p-color-base: var(--h5p-primary-color) !important;
            --h5p-color-text: var(--h5p-text-color) !important;
            --h5p-color-background: var(--h5p-background-color) !important;
          }

          /* Icon & Button Recovery - Aggressive */
          .h5p-content .h5p-icon, 
          .h5p-content [class*="h5p-icon-"],
          .h5p-content .h5p-button,
          .h5p-content .h5p-joubelui-button {
            color: var(--h5p-primary-color) !important;
            border-color: var(--h5p-primary-color) !important;
          }

          .h5p-content .h5p-icon:before,
          .h5p-content [class*="h5p-icon-"]:before {
            color: inherit !important;
          }

          /* SVG Icon Color Injection */
          .h5p-content svg path, 
          .h5p-content svg circle, 
          .h5p-content svg rect {
            fill: currentColor !important;
          }
        </style>
      `;

      const compatibilityScript = `
        <script>
          (function() {
            console.log('H5P Theme Compatibility Script Active');
            
            const cssVars = ${JSON.stringify(sanitizedVars)};
            const styleContent = document.getElementById('h5p-theme-overrides')?.innerHTML || '';

            const applyThemeToElement = (el) => {
              if (!el || !el.style) return;
              Object.entries(cssVars).forEach(([key, val]) => {
                el.style.setProperty(key, val, 'important');
              });
              // Apply modern mappings
              el.style.setProperty('--h5p-color-primary', cssVars['--h5p-theme-main-cta-base'] || '', 'important');
              el.style.setProperty('--h5p-color-base', cssVars['--h5p-theme-main-cta-base'] || '', 'important');
            };

            const injectStyles = (doc) => {
              if (!doc) return;
              if (doc.getElementById('h5p-theme-runtime-overrides')) return;
              const style = doc.createElement('style');
              style.id = 'h5p-theme-runtime-overrides';
              style.innerHTML = styleContent;
              doc.head.appendChild(style);
              applyThemeToElement(doc.documentElement);
              applyThemeToElement(doc.body);
            };

            // Initial injection
            injectStyles(document);

            document.addEventListener('DOMContentLoaded', () => {
              injectStyles(document);
              document.body.classList.add('h5p-content', 'h5p-modern');

              // Watch for H5P iframes and inject styles into them
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'IFRAME') {
                      node.addEventListener('load', () => {
                        try {
                          injectStyles(node.contentDocument);
                        } catch (e) {
                          console.warn('Could not inject styles into cross-origin H5P iframe');
                        }
                      });
                    }
                  });
                });
              });
              observer.observe(document.body, { childList: true, subtree: true });
              
              // Periodically check for existing iframes that might have been missed
              setInterval(() => {
                document.querySelectorAll('iframe').forEach(iframe => {
                  try {
                    if (iframe.contentDocument && !iframe.contentDocument.getElementById('h5p-theme-runtime-overrides')) {
                      injectStyles(iframe.contentDocument);
                    }
                  } catch (e) {}
                });
              }, 2000);

              setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
            });
          })();
        </script>
      `;

      // Inject <base> tag at the top of <head> for asset resolution fallback
      const baseTag = `<base href="${baseUrl}">`;
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>\n    ${baseTag}`);
      }

      /**
       * MERGE STRATEGY:
       * We inject our custom overrides at the VERY END of the <head>.
       * This ensures they are the last rules processed, giving them the 
       * highest natural precedence in the CSS cascade while preserving 
       * all original H5P functionality.
       */
      const closingHeadTag = "</head>";
      const closingHtmlTag = "</html>";
      const injection = `\n    ${styleBlock}\n    ${compatibilityScript}\n`;

      if (html.includes(closingHeadTag)) {
        html = html.replace(closingHeadTag, `${injection}${closingHeadTag}`);
      } else if (html.includes(closingHtmlTag)) {
        html = html.replace(closingHtmlTag, `${injection}${closingHtmlTag}`);
      } else {
        html = `${html}${injection}`;
      }

      res.send(html);
    } catch (error: any) {
      console.error("Error proxying H5P:", error.message);
      res.status(500).json({ error: "Failed to fetch H5P content", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
