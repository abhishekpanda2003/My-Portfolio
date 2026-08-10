/**
 * theme.js — design tokens shared by every component.
 *
 * There are no CSS files in this project: components style themselves with
 * inline `style` objects built from these values. Changing a token here
 * restyles the whole site.
 */

/** Colour palette. Dark navy base, teal primary, amber accent. */
export const C = {
  bg: "#0A0F1A",       // page background
  panel: "#0F1826",    // card surfaces
  panelAlt: "#0C1420", // recessed surfaces (tech tags)
  line: "#1B2B44",     // borders
  lineSoft: "#152238", // hairline dividers, blueprint grid
  teal: "#4FD1C5",     // primary accent
  amber: "#F2B705",    // secondary accent
  text: "#E7EDF5",     // headings and body

  // Two dimmer text tiers, same blue-grey hue as `text`. These were originally
  // #8B9AB3 / #5C6B84, which sat near or below 4.5:1 contrast on `bg` and read
  // as washed out on phone screens — keep any replacements at least this light.
  muted: "#AAB8CE",    // body copy, secondary labels
  mutedDim: "#8A9BB6", // captions, metadata
};

/** Font stacks. Mono carries the "engineering" voice; sans carries body copy. */
export const MONO = "'JetBrains Mono', monospace";
export const SANS = "'Inter', sans-serif";

/**
 * Nominal height of the fixed header, used for the hero's top padding.
 *
 * Note this is an estimate, not the measured value. Portfolio() measures the
 * real header at runtime and publishes it as the `--header-h` CSS variable,
 * which is what `scroll-margin-top` uses to align sections precisely.
 */
export const HEADER_H = 72;

/** Google Fonts import, injected into the single global <style> block. */
export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap');`;
