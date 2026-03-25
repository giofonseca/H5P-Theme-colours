# H5P Theme Picker (CSS Generator)

A specialized tool designed to generate the CSS variables required to customize the H5P theme in Moodle. This application provides a real-time preview and accessibility validation for H5P-style themes.

## 🚀 How to Use the Web App

1.  **Configure the Base Theme**: Use the "Configuration" panel to select your base H5P theme (e.g., Daylight) and the desired density (Large, Medium, Small).
2.  **Adjust Feedback Colors**: 
    *   Manually set colors for **Correct**, **Incorrect**, and **Neutral** states.
    *   Use the **"Auto-match to Brand"** button to automatically generate harmonious feedback colors based on your primary brand color.
3.  **Check Accessibility**: Review the "Accessibility Check" panel. It automatically calculates WCAG 2.0 contrast ratios. If a contrast is too low, it will suggest a compliant alternative that you can apply with one click.
4.  **Export for Moodle**:
    *   **Copy**: Click the "Copy" button in the "Moodle CSS Output" section.
    *   **Download**: Click "Download" to save the configuration as a `.css` file.
5.  **Apply to Moodle**:
    *   Log in to Moodle as an Administrator.
    *   Navigate to `Site Administration > Appearance > Themes > [Your Theme] > Advanced Settings`.
    *   Paste the copied CSS into the **"Custom CSS"** field.

## 🛠️ Reusing the Code Modules

The codebase is designed to be modular and easy to integrate into other React projects.

### 1. Color Utilities (`src/lib/colorUtils.ts`)
Contains logic for accessibility and color generation.
*   `getContrastRatio(fg, bg)`: Returns the WCAG contrast ratio.
*   `suggestBetterColor(fg, bg)`: Returns a hex code that meets the 4.5:1 contrast requirement.
*   `generateFeedbackSet(hue, sat, light)`: Generates a 3-color set (main, secondary, third) for feedback states.

### 2. UI Components (`src/components/`)
Each component is isolated and can be reused:
*   `AccessibilityPanel`: Handles WCAG validation and suggestions.
*   `FeedbackColorsPanel`: A grid of color inputs for feedback states.
*   `ResultsPanel`: Displays the final CSS output with copy/download functionality.

### 3. Types & Constants
*   `src/types.ts`: Shared TypeScript interfaces for theme data and color sets.
*   `src/constants.ts`: Default color values and metadata for feedback types.

## 📦 Development

This project uses **React**, **Tailwind CSS**, and **Lucide React** for icons. It integrates the `h5p-theme-picker` custom element.

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## ⚖️ Legal & Attribution
H5P is a registered trademark of H5P Group. This tool is an independent project by Giovanni Fonseca and is not affiliated with H5P Group. Based on the original [H5P Theme Picker](https://github.com/otacke/h5p-theme-picker) by Oliver Tacke.
