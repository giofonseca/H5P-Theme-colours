# H5P Theme Picker & Live Preview

A specialized tool for designing and testing custom themes for H5P content, specifically optimized for Moodle (`mod_hvp`) and WordPress integrations.

## Features

- **Brand-Driven Design**: Select a primary brand color and automatically generate harmonious feedback states (Correct, Incorrect, Neutral).
- **Accessibility First**: Real-time WCAG contrast checking for all color combinations.
- **H5P Live Preview (Alpha)**: A specialized proxy-based preview that allows you to see your custom theme applied to *any* live H5P embed URL.
- **Moodle Compatibility**: Injects CSS variables and compatibility scripts to ensure the "Modern" H5P look and feel works across different platforms.

## Project Structure

- `server.ts`: Express server that handles the H5P proxy logic, asset normalization, and style injection.
- `src/App.tsx`: Main application state and layout.
- `src/components/`:
  - `H5PPreviewPanel.tsx`: The live preview component with Alpha toggle.
  - `FeedbackColorsPanel.tsx`: Controls for Correct/Incorrect/Neutral states.
  - `AccessibilityPanel.tsx`: Real-time WCAG contrast reports.
  - `ConfigurationPanel.tsx`: Brand color and density controls.
- `src/constants.ts`: Default color values and configuration.
- `src/types.ts`: TypeScript interfaces for theme data.

## Security & Reusability

This project includes several production-ready security mitigations:

- **SSRF Protection**: The H5P proxy validates all URLs and blocks access to internal or private IP ranges (e.g., `localhost`, `10.x.x.x`).
- **XSS Sanitization**: All custom CSS variables are sanitized before injection to prevent script injection via malicious theme configurations.
- **Request Timeouts**: The proxy includes a 10-second timeout to prevent resource exhaustion from slow or hanging external targets.
- **Detailed JSDoc**: All components and utility functions are documented with JSDoc for easy reusability and maintenance.

## How the H5P Proxy Works

Because H5P content is typically served from a different domain than the theme picker, standard iframes cannot be styled due to CORS restrictions. 

This project uses a specialized backend proxy (`/api/proxy-h5p`) that:
1. Fetches the H5P HTML from the target URL.
2. Normalizes all relative asset paths (JS, CSS, fonts) to absolute URLs.
3. Injects custom CSS variables into the `<head>`.
4. Injects a compatibility script that ensures styles propagate into nested H5P iframes.
5. Returns the modified HTML to be rendered in a `srcDoc` iframe.

## Development

```bash
npm install
npm run dev
```

The application runs on port 3000.

## Production

```bash
npm run build
npm start
```

## License

CC0-1.0
