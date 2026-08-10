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
   TILT CARD — cheap CSS-based 3D hover, used on skill/project cards
--------------------------------------------------------------- */
export function TiltCard({ children, style, className }) {
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
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform 0.15s ease-out", willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   REVEAL ON SCROLL — replays every time the element re-enters view
--------------------------------------------------------------- */
export function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   SMALL BITS
--------------------------------------------------------------- */
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

/** Blueprint grid backdrop — shared by every section on both pages. */
export function BlueprintGrid({ opacity = 0.5 }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, opacity, pointerEvents: "none",
        backgroundImage: `linear-gradient(${C.lineSoft} 1px, transparent 1px), linear-gradient(90deg, ${C.lineSoft} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
      }}
    />
  );
}

export function SectionShell({ id, children, alt, style }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        padding: "110px 24px",
        background: alt ? C.panelAlt : C.bg,
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
