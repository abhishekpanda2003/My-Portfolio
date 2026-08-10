import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------
   WIREFRAME 3D — a slowly rotating torus knot drawn as a glowing
   wireframe ribbon, used to fill the column beside the education
   timeline.

   Deliberately a 2D canvas, not Three.js: the page already runs two
   WebGL contexts (the hero skill graph and the particle field), and
   a few hundred projected line segments per frame costs far less
   than a third context. The 3D is done by hand — rotate the points,
   divide by depth, draw.

   A knot rather than another sphere so it reads as its own object
   next to the hero graph.
--------------------------------------------------------------- */

const SEGMENTS = 240;   // sample points around the knot
const P = 2;            // times the curve winds around the torus axis
const Q = 3;            // times it winds through the hole
const FOV = 9;          // perspective strength — lower is more dramatic
const DOT_EVERY = 10;   // draw a vertex marker every N points

const TEAL = "79, 209, 197";
const AMBER = "242, 183, 5";

export default function Wireframe3D({ height = 340 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // sample the torus knot once — the shape never changes, only its rotation
    const points = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const phi = (i / SEGMENTS) * Math.PI * 2;
      const r = Math.cos(Q * phi) + 2;
      points.push([
        r * Math.cos(P * phi),
        r * Math.sin(P * phi),
        -Math.sin(Q * phi) * 1.6,
      ]);
    }

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // pointer parallax, eased toward the cursor
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.9;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.7;
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });

    const projected = new Array(SEGMENTS);

    let spin = 0;
    const draw = () => {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      const ay = spin + current.x;
      const ax = 0.5 + current.y;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      const cosX = Math.cos(ax), sinX = Math.sin(ax);

      const cx = w / 2;
      const cy = h / 2;
      const unit = Math.min(w, h) / 7.4;

      // rotate + project every sample
      for (let i = 0; i < SEGMENTS; i++) {
        const [px, py, pz] = points[i];
        // yaw
        const x1 = px * cosY + pz * sinY;
        const z1 = -px * sinY + pz * cosY;
        // pitch
        const y1 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        const depth = FOV / (FOV + z2);
        projected[i] = [cx + x1 * depth * unit, cy + y1 * depth * unit, depth];
      }

      // ribbon — one stroke per segment so each can fade with its own depth
      ctx.lineCap = "round";
      for (let i = 0; i < SEGMENTS; i++) {
        const a = projected[i];
        const b = projected[(i + 1) % SEGMENTS];
        const depth = (a[2] + b[2]) / 2;
        // depth sits around 1.0; map it to a visible alpha ramp
        const alpha = Math.max(0.05, Math.min(1, (depth - 0.78) * 3.4));
        ctx.strokeStyle = `rgba(${TEAL}, ${alpha * 0.85})`;
        ctx.lineWidth = Math.max(0.6, depth * 1.7);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }

      // vertex markers, with a couple of amber accents
      ctx.shadowBlur = 8;
      for (let i = 0; i < SEGMENTS; i += DOT_EVERY) {
        const [x, y, depth] = projected[i];
        const alpha = Math.max(0.08, Math.min(1, (depth - 0.78) * 3.4));
        const isAccent = (i / DOT_EVERY) % 4 === 0;
        const color = isAccent ? AMBER : TEAL;
        ctx.shadowColor = `rgba(${color}, ${alpha * 0.7})`;
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, depth * (isAccent ? 2.6 : 1.9)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    let raf = 0;
    let running = false;
    const frame = () => {
      spin += 0.0035;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    draw(); // paint immediately so it's never blank

    // only animate while actually on screen
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
            { threshold: 0 }
          )
        : null;
    if (io) io.observe(canvas);
    else start();

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      resize();
      draw();
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(canvas);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height, pointerEvents: "none" }}
    />
  );
}
