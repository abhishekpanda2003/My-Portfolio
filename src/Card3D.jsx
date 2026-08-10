import { useEffect, useRef } from "react";
import { C } from "./theme";

/* ---------------------------------------------------------------
    CARD 3D — pointer-driven 3D card.

    Four effects layered together:
      1. tilt    — the card rotates toward the cursor on two axes
      2. glow    — a soft teal pool of light follows the cursor
      3. border  — a 1px ring that lights up nearest the cursor
      4. parallax— inner content sits at different translateZ depths,
                    so the title floats above the background as it tilts

    Everything is driven by CSS custom properties written straight to
    the DOM node inside a rAF, so moving the mouse never re-renders
    React. The card only pays for the effect while it is hovered.
--------------------------------------------------------------- */

/** Injected once by App.jsx into the global <style> block. */
export const CARD3D_CSS = `
  .card3d-scene {
    perspective: 900px;
    height: 100%;
  }

  .card3d-inner {
    position: relative;
    height: 100%;
    transform-style: preserve-3d;
    transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
    /* slow, eased settle when the pointer leaves */
    transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1),
                box-shadow 0.4s ease,
                border-color 0.4s ease;
    will-change: transform;
  }

  /* while hovered the tilt must track the cursor almost instantly */
  .card3d-scene:hover .card3d-inner {
    transition: transform 0.08s ease-out,
                box-shadow 0.4s ease,
                border-color 0.4s ease;
    box-shadow: 0 22px 50px -20px rgba(0, 0, 0, 0.9),
                0 0 32px -8px rgba(79, 209, 197, 0.28);
    border-color: ${C.teal};
  }

  /* pool of light under the cursor */
  .card3d-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.35s ease;
    background: radial-gradient(
      340px circle at var(--mx, 50%) var(--my, 50%),
      rgba(79, 209, 197, 0.15),
      transparent 62%
    );
  }
  .card3d-scene:hover .card3d-glow { opacity: 1; }

  /* specular sheen — subtler, whiter, tighter than the glow */
  .card3d-glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    transition: opacity 0.35s ease;
    background: radial-gradient(
      190px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 255, 255, 0.09),
      transparent 55%
    );
  }
  .card3d-scene:hover .card3d-glare { opacity: 1; }

  /* 1px ring that glows brightest nearest the cursor.
     mask-composite carves the fill out of the middle, leaving a border. */
  .card3d-border {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    padding: 1px;
    transition: opacity 0.35s ease;
    background: radial-gradient(
      240px circle at var(--mx, 50%) var(--my, 50%),
      rgba(79, 209, 197, 0.85),
      transparent 68%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
  .card3d-scene:hover .card3d-border { opacity: 1; }

  /* content layers — flat at rest, lifted while hovered.
     position/z-index keep them painting above the glow overlays. */
  .card3d-layer {
    position: relative;
    z-index: 1;
    transform: translateZ(0);
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .card3d-scene:hover .card3d-layer {
    transform: translateZ(calc(var(--depth, 0) * 1px));
    transition: transform 0.12s ease-out;
  }

  /* Touch devices have no hover: keep the card flat and legible. */
  @media (hover: none) {
    .card3d-inner { transform: none !important; }
    .card3d-layer { transform: none !important; }
    .card3d-glow, .card3d-glare, .card3d-border { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .card3d-inner { transform: none !important; }
    .card3d-scene:hover .card3d-layer { transform: none !important; }
  }
`;

/**
 * A content layer inside a Card3D.
 * `depth` is how far (in px) the layer floats above the card face on hover.
 */
export function CardLayer({ depth = 0, children, style }) {
  return (
    <div className="card3d-layer" style={{ "--depth": depth, ...style }}>
      {children}
    </div>
  );
}

/**
 * @param {number} maxTilt  peak rotation in degrees on each axis
 * @param {object} style    applied to the card face itself
 */
export function Card3D({ children, style, maxTilt = 14 }) {
  const sceneRef = useRef(null);
  const innerRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handleMove = (e) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = innerRef.current;
      if (!el) return;
      const px = x / rect.width - 0.5;   // -0.5 .. 0.5
      const py = y / rect.height - 0.5;
      el.style.setProperty("--ry", `${px * maxTilt}deg`);
      el.style.setProperty("--rx", `${-py * maxTilt}deg`);
      el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      el.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frameRef.current);
    const el = innerRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={sceneRef}
      className="card3d-scene"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div ref={innerRef} className="card3d-inner" style={style}>
        <div className="card3d-glow" />
        <div className="card3d-glare" />
        <div className="card3d-border" />
        {children}
      </div>
    </div>
  );
}
