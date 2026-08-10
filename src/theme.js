/* ---------------------------------------------------------------
   PALETTE / TOKENS  (edit these to restyle the whole site)
   Shared by App.jsx and Projects.jsx so both pages stay in sync.
--------------------------------------------------------------- */
export const C = {
  bg: "#0A0F1A",
  panel: "#0F1826",
  panelAlt: "#0C1420",
  line: "#1B2B44",
  lineSoft: "#152238",
  teal: "#4FD1C5",
  amber: "#F2B705",
  text: "#E7EDF5",
  // Same blue-grey hue family, brightened for readability against the dark bg.
  // The old values (#8B9AB3 / #5C6B84) sat near or below 4.5:1 contrast and
  // read as washed out, especially on phone screens.
  muted: "#AAB8CE",
  mutedDim: "#8A9BB6",
};

export const MONO = "'JetBrains Mono', monospace";
export const SANS = "'Inter', sans-serif";

// height of the fixed header — pages offset their top padding by this
export const HEADER_H = 72;

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap');`;
