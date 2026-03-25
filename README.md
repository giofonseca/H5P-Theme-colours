# H5P Theme Picker (CSS Generator)

A specialized tool designed to generate the CSS variables required to customize the H5P theme in Moodle. This application provides a real-time preview, intelligent color generation, and comprehensive accessibility validation.

## 🚀 Key Features

*   **Real-time Preview**: Integrates the `h5p-theme-picker` custom element for an instant look at your theme changes.
*   **Intelligent Feedback Colors**: 
    *   **Auto-match to Brand**: Generate harmonious Correct, Incorrect, and Neutral color sets based on your primary brand color with a single click.
    *   **Manual Control**: Fine-tune every feedback state color (Main, Secondary, Third).
*   **Comprehensive Accessibility Check**:
    *   **WCAG 2.0 Validation**: Real-time contrast ratio calculations for all feedback states and Call to Action (CTA) colors.
    *   **One-Click Fixes**: Intelligent suggestions for compliant colors that can be applied instantly.
    *   **Prioritized UX**: CTA accessibility is prioritized for better visibility of primary actions.
*   **Robust Synchronization**: Multi-layered sync mechanism ensures that changes in the accessibility panel or feedback settings are instantly reflected in the final CSS output.
*   **Export for Moodle**: Copy or download the generated CSS variables, ready to be pasted into Moodle's custom CSS settings.

## 🛠️ How to Use

1.  **Configure the Base Theme**: Select your base H5P theme (e.g., Daylight) and density in the "Configuration" panel.
2.  **Adjust Colors**: Use the "Feedback Colors" panel to set your states. Try "Auto-match to Brand" for a quick, professional look.
3.  **Validate Accessibility**: Check the "Accessibility Check" panel. Apply suggested colors to ensure your theme is inclusive and compliant.
4.  **Apply to Moodle**:
    *   Copy the CSS from the "Moodle CSS Output" section.
    *   In Moodle: `Site Administration > Appearance > Themes > [Your Theme] > Advanced Settings`.
    *   Paste into the **"Custom CSS"** field.

## 💻 Technical Implementation

### Bidirectional Synchronization
The app implements a sophisticated sync strategy for the `h5p-theme-picker` custom element:
*   **Direct Input Manipulation**: Updates internal form elements of the picker directly for maximum compatibility.
*   **CSS Variable Injection**: Sets variables on the element's style object for immediate visual feedback.
*   **Multi-API Support**: Supports `setValues()`, `themeData` properties, and `theme-data` attributes.

### Color Utilities (`src/lib/colorUtils.ts`)
*   `getContrastRatio`: Precise WCAG contrast calculation.
*   `suggestBetterColor`: Algorithmic color adjustment to meet 4.5:1 ratio.
*   `generateFeedbackSet`: HSL-based generation of harmonious color triads.

## 📦 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## ⚖️ Legal & Attribution
H5P is a registered trademark of H5P Group. This tool is an independent project by Giovanni Fonseca and is not affiliated with H5P Group. Based on the original [H5P Theme Picker](https://github.com/otacke/h5p-theme-picker) by Oliver Tacke. Source code available on [GitHub](https://github.com/giofonseca/H5P-Theme-colours).
