import { Component, useEffect, useRef, useState } from "react";
import { C, MONO } from "./theme";

/* ---------------------------------------------------------------
   ERROR BOUNDARY — so a single failing part (e.g. the 3D graph)
   can't blank out the whole page.
--------------------------------------------------------------- */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Section failed to render:", error, info);
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

/* ---------------------------------------------------------------
   TILT CARD — lightweight CSS 3D hover for the experience, skill and
   contact cards. Writes the transform straight to the node so moving
   the pointer never re-renders React.

   The richer effect on project cards (glow, parallax layers) lives in
   Card3D.jsx; this is the cheap version for cards that only need a tilt.
--------------------------------------------------------------- */
export function TiltCard({ children, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg) translateZ(4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform 0.15s ease-out", willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   REVEAL ON SCROLL — animates in on the way DOWN only.

   Scrolling back up must never replay the fade, but the reveal should still
   re-arm so a later downward pass animates again. Two rules get both:

     reveal  when the element becomes ≥15% visible
     re-arm  only once it is *completely* below the viewport

   Resetting solely below the fold means the element is off-screen when its
   opacity snaps back — so scrolling up is perfectly still. Anything that
   leaves via the top simply stays revealed, so scrolling back up over it
   shows it already in place.
--------------------------------------------------------------- */
const REVEAL_DURATION = 0.38;   // seconds
const REVEAL_STAGGER = 0.45;    // scales the per-item `delay` prop
const REVEAL_TRAVEL = 14;       // px the element rises as it fades in
const REVEAL_THRESHOLD = 0.15;  // visible fraction that triggers the reveal

export function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry.intersectionRatio >= REVEAL_THRESHOLD) {
          setVisible(true);
        } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
          // fully past the bottom edge: re-arm out of sight
          setVisible(false);
        }
      },
      // 0 fires when it clears the viewport entirely, 0.15 when it reveals
      { threshold: [0, REVEAL_THRESHOLD] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const ms = Math.round(delay * REVEAL_STAGGER);
  const ease = `${REVEAL_DURATION}s cubic-bezier(0.22, 0.9, 0.3, 1) ${ms}ms`;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${REVEAL_TRAVEL}px)`,
        transition: `opacity ${ease}, transform ${ease}`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   SECTION CHROME
--------------------------------------------------------------- */

/** Section heading: the title plus its short teal underline. */
export function CommentHeader({ title }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: MONO, color: C.text, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      <div style={{ width: 56, height: 3, background: C.teal, marginTop: 16 }} />
    </div>
  );
}

/**
 * Faint graph-paper backdrop behind each section, masked to an ellipse so it
 * fades out at the edges rather than ending on a hard line. Internal to
 * SectionShell — nothing else needs it directly.
 */
function BlueprintGrid() {
  return (
    <div
      style={{
        position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none",
        backgroundImage: `linear-gradient(${C.lineSoft} 1px, transparent 1px), linear-gradient(90deg, ${C.lineSoft} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
      }}
    />
  );
}

/**
 * Wrapper every page section uses: the blueprint backdrop, consistent padding,
 * a max-width content column, and the `id` the nav scrolls to.
 */
export function SectionShell({ id, children, style }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        // z-index keeps section content above the fixed particle backdrop;
        // every section is transparent so the constellation reads identically
        // from top to bottom — only the 1px border separates them
        zIndex: 1,
        // Asymmetric on purpose: the small top pad is what you see right under
        // the fixed header after clicking a nav link, so it stays tight; the
        // large bottom pad keeps sections apart while free-scrolling.
        padding: "44px 24px 96px",
        background: "transparent",
        borderTop: `1px solid ${C.line}`,
        overflow: "hidden",
        ...style,
      }}
    >
      <BlueprintGrid />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>{children}</div>
    </section>
  );
}
