import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ---------------------------------------------------------------
   PARTICLE FIELD — interactive 3D constellation background.

   A drifting cloud of points in 3D space. Any two points closer
   than a threshold get a line drawn between them, brightest when
   they are nearest — so the mesh continuously forms and dissolves
   as the cloud moves. The whole field parallaxes toward the cursor,
   and points are gently pushed away from it.

   Notes on how this stays cheap:
   - The line buffer is allocated once at max size; each frame only
     rewrites the used span and calls setDrawRange. No re-allocation.
   - Pointer tracking is on `window`, and the canvas is pointer-events:
     none, so the background never intercepts clicks on the cards.
   - The loop pauses when the tab is hidden.
--------------------------------------------------------------- */

const COUNT = 110;            // particles — pair checks are O(n²), keep modest
const MAX_LINES = 1400;       // ceiling on simultaneous connections
const CAMERA_Z = 50;
const FOV = 60;

const TEAL = new THREE.Color(0x4fd1c5);
const AMBER = new THREE.Color(0xf2b705);

export default function ParticleField() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer, raf;
    let onResize, onPointerMove, onVisibility;
    const disposables = [];

    try {
      let width = mount.clientWidth || window.innerWidth;
      let height = mount.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 400);
      camera.position.set(0, 0, CAMERA_Z);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // world-space extents of the camera frustum at z = 0
      const view = { w: 0, h: 0 };
      const measure = () => {
        view.h = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
        view.w = view.h * (width / height);
      };
      measure();

      const bounds = () => ({
        x: (view.w / 2) * 1.15,
        y: (view.h / 2) * 1.15,
        z: 20,
      });

      // ---- particles -------------------------------------------------
      const positions = new Float32Array(COUNT * 3);
      const velocities = new Float32Array(COUNT * 3);
      const pointColors = new Float32Array(COUNT * 3);

      const b0 = bounds();
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2 * b0.x;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * b0.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2 * b0.z;

        velocities[i * 3] = (Math.random() - 0.5) * 0.045;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.045;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;

        // every 7th point is amber, the rest teal — matches the palette
        const c = i % 7 === 0 ? AMBER : TEAL;
        pointColors[i * 3] = c.r;
        pointColors[i * 3 + 1] = c.g;
        pointColors[i * 3 + 2] = c.b;
      }

      const pointGeom = new THREE.BufferGeometry();
      pointGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      pointGeom.setAttribute("color", new THREE.BufferAttribute(pointColors, 3));
      const pointMat = new THREE.PointsMaterial({
        size: 0.5,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const points = new THREE.Points(pointGeom, pointMat);
      disposables.push(pointGeom, pointMat);

      // ---- connection lines -------------------------------------------
      const linePositions = new Float32Array(MAX_LINES * 2 * 3);
      const lineColors = new Float32Array(MAX_LINES * 2 * 3);
      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
      lineGeom.setAttribute("color", new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });
      const lines = new THREE.LineSegments(lineGeom, lineMat);
      disposables.push(lineGeom, lineMat);

      const group = new THREE.Group();
      group.add(points);
      group.add(lines);
      scene.add(group);

      // ---- pointer ----------------------------------------------------
      // tracked on window so the canvas can stay pointer-events: none
      const pointer = { x: 0, y: 0, active: false };
      const target = { rx: 0, ry: 0 };

      onPointerMove = (e) => {
        const rect = mount.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        pointer.active = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;
        if (!pointer.active) return;
        // world-space cursor position on the z = 0 plane
        pointer.x = (nx * 2 - 1) * (view.w / 2);
        pointer.y = -(ny * 2 - 1) * (view.h / 2);
        target.ry = (nx * 2 - 1) * 0.22;
        target.rx = (ny * 2 - 1) * 0.16;
      };
      window.addEventListener("mousemove", onPointerMove, { passive: true });

      // ---- animation ----------------------------------------------------
      const REPEL_RADIUS = 9;
      const CONNECT_DIST = () => view.h * 0.17;

      const step = () => {
        const bnd = bounds();
        const connect = CONNECT_DIST();
        const connectSq = connect * connect;

        // move particles
        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3, iy = ix + 1, iz = ix + 2;

          positions[ix] += velocities[ix];
          positions[iy] += velocities[iy];
          positions[iz] += velocities[iz];

          // push away from the cursor
          if (pointer.active) {
            const dx = positions[ix] - pointer.x;
            const dy = positions[iy] - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const push = (1 - d / REPEL_RADIUS) * 0.06;
              velocities[ix] += (dx / d) * push;
              velocities[iy] += (dy / d) * push;
            }
          }

          // damping keeps the repel impulse from accumulating forever
          velocities[ix] *= 0.985;
          velocities[iy] *= 0.985;
          velocities[iz] *= 0.99;

          // never fully stall — keep a minimum drift
          if (Math.abs(velocities[ix]) < 0.006) velocities[ix] += (Math.random() - 0.5) * 0.004;
          if (Math.abs(velocities[iy]) < 0.006) velocities[iy] += (Math.random() - 0.5) * 0.004;

          // bounce off the frustum walls
          if (positions[ix] < -bnd.x || positions[ix] > bnd.x) velocities[ix] *= -1;
          if (positions[iy] < -bnd.y || positions[iy] > bnd.y) velocities[iy] *= -1;
          if (positions[iz] < -bnd.z || positions[iz] > bnd.z) velocities[iz] *= -1;
        }
        pointGeom.attributes.position.needsUpdate = true;

        // rebuild connections
        let n = 0;
        for (let i = 0; i < COUNT && n < MAX_LINES; i++) {
          const ax = positions[i * 3], ay = positions[i * 3 + 1], az = positions[i * 3 + 2];
          for (let j = i + 1; j < COUNT && n < MAX_LINES; j++) {
            const dx = ax - positions[j * 3];
            const dy = ay - positions[j * 3 + 1];
            const dz = az - positions[j * 3 + 2];
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 > connectSq) continue;

            // nearer pairs draw brighter — this is the "fade" on a dark bg
            const strength = 1 - Math.sqrt(d2) / connect;
            const o = n * 6;

            linePositions[o] = ax;
            linePositions[o + 1] = ay;
            linePositions[o + 2] = az;
            linePositions[o + 3] = positions[j * 3];
            linePositions[o + 4] = positions[j * 3 + 1];
            linePositions[o + 5] = positions[j * 3 + 2];

            const r = TEAL.r * strength, g = TEAL.g * strength, b = TEAL.b * strength;
            lineColors[o] = r; lineColors[o + 1] = g; lineColors[o + 2] = b;
            lineColors[o + 3] = r; lineColors[o + 4] = g; lineColors[o + 5] = b;

            n++;
          }
        }
        lineGeom.setDrawRange(0, n * 2);
        lineGeom.attributes.position.needsUpdate = true;
        lineGeom.attributes.color.needsUpdate = true;

        // ease the whole field toward the cursor
        group.rotation.y += (target.ry - group.rotation.y) * 0.04;
        group.rotation.x += (target.rx - group.rotation.x) * 0.04;

        renderer.render(scene, camera);
      };

      const animate = () => {
        step();
        raf = requestAnimationFrame(animate);
      };

      if (reduceMotion) {
        step(); // one static frame, no loop
      } else {
        animate();
      }

      // pause while the tab is in the background
      onVisibility = () => {
        if (reduceMotion) return;
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          cancelAnimationFrame(raf);
          animate();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      onResize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        if (!w || !h) return;
        width = w;
        height = h;
        measure();
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (reduceMotion) step();
      };
      window.addEventListener("resize", onResize);
    } catch (err) {
      // no WebGL (or context creation failed) — the page renders fine without it
      console.error("ParticleField failed to initialize:", err);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (onPointerMove) window.removeEventListener("mousemove", onPointerMove);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      disposables.forEach((d) => d.dispose?.());
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
    >
      {/* sticky keeps one viewport-sized canvas in view as the page scrolls,
          instead of stretching the scene over the full document height */}
      <div ref={mountRef} style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }} />
    </div>
  );
}
