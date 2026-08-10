import { Component, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Mail, Phone, Instagram, Linkedin, Twitter, MessageCircle,
  Menu, X, Download, ChevronDown, GraduationCap, Briefcase,
} from "lucide-react";

/* ---------------------------------------------------------------
   PALETTE / TOKENS  (edit these to restyle the whole site)
--------------------------------------------------------------- */
const C = {
  bg: "#0A0F1A",
  panel: "#0F1826",
  panelAlt: "#0C1420",
  line: "#1B2B44",
  lineSoft: "#152238",
  teal: "#4FD1C5",
  amber: "#F2B705",
  text: "#E7EDF5",
  muted: "#8B9AB3",
  mutedDim: "#5C6B84",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap');`;

/* ---------------------------------------------------------------
   ERROR BOUNDARY — so a single failing part (e.g. the 3D graph)
   can't blank out the whole page.
--------------------------------------------------------------- */
class ErrorBoundary extends Component {
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
   CONTENT — bio, expertise & philosophy sourced from your LinkedIn
   "About" section. Birthday/age are still from the original site
   since LinkedIn didn't include them — update freely.
--------------------------------------------------------------- */
const PROFILE = {
  name: "Abhishek Panda",
  role: "Project Engineer",
  company: "Wipro",
  domain: "GenAI Engineering — Agentic AI",
  university: "KIIT University",
  degree: "B.Tech, Information Technology",
  birthday: "22 Dec 2003",
  age: 20,
  email: "abhishekpanda494@gmail.com",
  phone: "+91 7383699772",
  bioShort:
    "As a Project Engineer at Wipro, I now work on the GenAI Engineering team, designing and building agentic AI systems — LLM-powered agents that plan, reason, and act autonomously. I started my journey here in Security Intelligence & Assurance (SIA), which shaped how I think about building resilient, trustworthy systems. My technical foundation goes back to KIIT University, where I earned my B.Tech in Information Technology.",
  bioLong:
    "I'm passionate about the intersection of robust software engineering and applied AI. My experience spans building full-stack applications, architecting real-time systems that prioritize performance and data integrity, and now designing agentic workflows that let LLMs reason, use tools, and complete multi-step tasks reliably.",
  philosophy:
    "I believe good agentic systems are engineered, not prompted into existence — reliability, evaluation, and guardrails matter as much as capability. That instinct comes straight from my security background: assume things can fail, and design for it. I enjoy solving complex problems, whether it's orchestrating a multi-agent workflow or optimizing a database schema.",
  connect:
    "I'm always looking to engage with fellow developers, AI engineers, and tech enthusiasts working on agents and applied GenAI. Feel free to reach out!",
};

const SOCIALS = [
  { icon: Instagram, url: "https://www.instagram.com/a.b.h.i._22/", label: "Instagram" },
  { icon: Twitter, url: "https://twitter.com/", label: "Twitter" },
  { icon: Linkedin, url: "https://www.linkedin.com/in/abhishekpanda2003/", label: "LinkedIn" },
  { icon: MessageCircle, url: "https://wa.me/7383699772", label: "WhatsApp" },
];

const EDUCATION = [
  { years: "2018 — 2019", title: "10th Grade", detail: "Secondary schooling — foundation year." },
  { years: "2020 — 2021", title: "12th Grade", detail: "Higher secondary — focus on science & math." },
  { years: "2021 — 2025", title: "B.Tech, Information Technology", detail: "KIIT University — core CS, DSA & backend systems." },
];

const EXPERIENCE = [
  { title: "Project Engineer — GenAI Engineering", org: "Wipro", detail: "Designing and building agentic AI systems — LLM agents that plan, use tools, and act autonomously.", current: true },
  { title: "Virtual Internship", org: "Bharat Intern", detail: "Remote software-development internship." },
  { title: "On-Site Internship", org: "DataVision Software Solution Ltd", detail: "Hands-on backend & database work." },
];

// order matters — index 0 is graph-center-adjacent to more nodes
const SKILLS = [
  { name: "Java (21)", group: "Backend", level: 85 },
  { name: "Spring Boot", group: "Backend", level: 75 },
  { name: "Python", group: "Language", level: 80 },
  { name: "MySQL", group: "Database", level: 90 },
  { name: "Prompt Engineering", group: "Agentic AI", level: 75 },
];

// dedicated node set for the 3D hero graph
const GRAPH_SKILLS = ["Java 21", "Spring Boot", "Python", "MySQL", "Prompt Engineering", "AI Agents"];

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/* ---------------------------------------------------------------
   CONTACT FORM — powered by Formspree (https://formspree.io).
   1. Create a free account at formspree.io
   2. Create a new form, copy its endpoint (looks like
      "https://formspree.io/f/xxxxabcd")
   3. Paste it below, replacing the placeholder.
   Until you do this, submissions will fail with a clear error
   instead of silently pretending to send.
--------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrpzpavk";

/* ---------------------------------------------------------------
   3D SKILL GRAPH — the signature element.
   Skills rendered as a node graph (center = Abhishek), because
   the site owner studies Data Structures & Graphs — the hero
   literally is one.
--------------------------------------------------------------- */
function SkillGraph() {
  const mountRef = useRef(null);
  const labelsRef = useRef([]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer, raf, onMouseMove, onResize;

    try {
      const width = mount.clientWidth || 800;
      const height = mount.clientHeight || 600;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 9);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // faint wireframe sphere shell (blueprint feel)
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.6, 1),
      new THREE.MeshBasicMaterial({ color: 0x1b2b44, wireframe: true, transparent: true, opacity: 0.35 })
    );
    group.add(shell);

    // node positions: center + skills on a golden-spiral sphere
    const n = GRAPH_SKILLS.length;
    const nodePositions = [new THREE.Vector3(0, 0, 0)]; // center = Abhishek
    const radius = 3.1;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = (Math.PI * (3 - Math.sqrt(5))) * i;
      nodePositions.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
    }

    // edges: center -> every skill, plus a few cross-links so it truly reads as a graph
    const edges = [];
    for (let i = 1; i <= n; i++) edges.push([0, i]);
    const cross = [[1, 7], [3, 6], [2, 6], [5, 3]]; // indices into nodePositions (1-based skills)
    cross.forEach(([a, b]) => { if (a <= n && b <= n) edges.push([a, b]); });

    const lineGeom = new THREE.BufferGeometry();
    const linePositions = [];
    edges.forEach(([a, b]) => {
      linePositions.push(nodePositions[a].x, nodePositions[a].y, nodePositions[a].z);
      linePositions.push(nodePositions[b].x, nodePositions[b].y, nodePositions[b].z);
    });
    lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4fd1c5, transparent: true, opacity: 0.45 });
    group.add(new THREE.LineSegments(lineGeom, lineMat));

    // node spheres
    const nodeMeshes = [];
    nodePositions.forEach((pos, i) => {
      const isCenter = i === 0;
      const geo = new THREE.SphereGeometry(isCenter ? 0.22 : 0.13, 20, 20);
      const mat = new THREE.MeshBasicMaterial({ color: isCenter ? 0xf2b705 : 0x4fd1c5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      group.add(mesh);
      nodeMeshes.push(mesh);

      // subtle glow ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(isCenter ? 0.3 : 0.19, isCenter ? 0.34 : 0.22, 32),
        new THREE.MeshBasicMaterial({ color: isCenter ? 0xf2b705 : 0x4fd1c5, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
      );
      ring.position.copy(pos);
      group.add(ring);
    });

    // faint particle dust
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 200;
    const dustPos = [];
    for (let i = 0; i < dustCount; i++) {
      dustPos.push((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16);
    }
    dustGeo.setAttribute("position", new THREE.Float32BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x1b2b44, size: 0.03 }));
    scene.add(dust);

    let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
    onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = mouseX * 0.5;
      targetRotX = mouseY * 0.3;
    };
    mount.addEventListener("mousemove", onMouseMove);

    const projected = new THREE.Vector3();
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      group.rotation.y += 0.0022;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.03;
      group.rotation.y += (targetRotY * 0.15);
      dust.rotation.y = t * 0.01;

      // project node positions to screen space for HTML labels
      nodeMeshes.forEach((mesh, i) => {
        mesh.getWorldPosition(projected);
        const v = projected.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * width;
        const y = (-v.y * 0.5 + 0.5) * height;
        const el = labelsRef.current[i];
        if (el) {
          el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
          const scale = THREE.MathUtils.clamp(1 - v.z * 0.3, 0.55, 1.15);
          el.style.opacity = v.z < 1 ? String(THREE.MathUtils.clamp(1.2 - v.z, 0.15, 1)) : "0";
          el.style.fontSize = `${11 * scale}px`;
        }
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    } catch (err) {
      // 3D graph failed (e.g. no WebGL support) — fail quietly, rest of the site still renders.
      console.error("SkillGraph failed to initialize:", err);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (mount && onMouseMove) mount.removeEventListener("mousemove", onMouseMove);
      if (onResize) window.removeEventListener("resize", onResize);
      if (renderer) {
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const labels = ["Abhishek", ...GRAPH_SKILLS];

  return (
    <div ref={mountRef} style={{ position: "absolute", inset: 0, cursor: "grab" }}>
      {labels.map((label, i) => (
        <div
          key={label}
          ref={(el) => (labelsRef.current[i] = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: i === 0 ? 700 : 500,
            color: i === 0 ? C.amber : C.teal,
            letterSpacing: "0.02em",
            textShadow: "0 0 8px rgba(0,0,0,0.9)",
          }}
        >
          {i === 0 ? label : `/${label}`}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   TILT CARD — cheap CSS-based 3D hover, used on skill/experience cards
--------------------------------------------------------------- */
function TiltCard({ children, style }) {
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
   REVEAL ON SCROLL
--------------------------------------------------------------- */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
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
function CommentHeader({ index, label, title }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: C.mutedDim, fontSize: 13, marginBottom: 8 }}>
        {`// ${index}_${label.toUpperCase().replace(/\s/g, "_")}`}
      </div>
      <h2 style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      <div style={{ width: 56, height: 3, background: C.teal, marginTop: 16 }} />
    </div>
  );
}

function SectionShell({ id, children, alt }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        padding: "110px 24px",
        background: alt ? C.panelAlt : C.bg,
        borderTop: `1px solid ${C.line}`,
        overflow: "hidden",
      }}
    >
      {/* blueprint grid backdrop */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none",
          backgroundImage: `linear-gradient(${C.lineSoft} 1px, transparent 1px), linear-gradient(90deg, ${C.lineSoft} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
      />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------- */
export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formState),
      });
      if (res.ok) {
        setStatus("sent");
        setFormState({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        a { color: inherit; }
        input, textarea { font-family: 'Inter', sans-serif; }
        input:focus, textarea:focus { outline: 2px solid ${C.teal}; outline-offset: 2px; }
        ::selection { background: ${C.teal}; color: #0A0F1A; }
        .nav-link:hover { color: ${C.teal} !important; }
        .social-btn:hover { border-color: ${C.teal} !important; color: ${C.teal} !important; transform: translateY(-2px); }
        .cv-btn:hover { background: ${C.teal} !important; color: #0A0F1A !important; }
        .submit-btn:hover { background: ${C.amber} !important; border-color: ${C.amber} !important; color: #0A0F1A !important; }
        @media (max-width: 720px) { .desktop-nav { display: none !important; } .mobile-toggle { display: flex !important; } .contact-grid { grid-template-columns: 1fr !important; } .about-info-grid { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      {/* NAV */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(10,15,26,0.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => scrollTo("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, background: C.teal, display: "inline-block" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 17, color: C.text }}>abhishek<span style={{ color: C.teal }}>.dev</span></span>
          </button>

          <nav className="desktop-nav" style={{ display: "flex", gap: 32 }}>
            {NAV.map((item, i) => (
              <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.muted, letterSpacing: "0.03em" }}>
                <span style={{ color: C.mutedDim }}>{String(i + 1).padStart(2, "0")}·</span> {item.label}
              </button>
            ))}
          </nav>

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: `1px solid ${C.line}`, padding: 8, color: C.text, cursor: "pointer" }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop: `1px solid ${C.line}`, padding: "12px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)} style={{ textAlign: "left", background: "none", border: "none", padding: "10px 0", color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* HOME / HERO */}
      <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 72 }}>
        <ErrorBoundary fallback={null}>
          <SkillGraph />
        </ErrorBoundary>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 24px", width: "100%", pointerEvents: "none" }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: C.teal, fontSize: 13, marginBottom: 18, letterSpacing: "0.04em" }}>
              // whoami
            </div>
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 800, lineHeight: 1.08, margin: 0, letterSpacing: "-0.02em" }}>
              Abhishek<br />Panda
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(15px, 2vw, 19px)", color: C.amber, marginTop: 18, fontWeight: 500 }}>
              &gt; {PROFILE.role} @ {PROFILE.company} · {PROFILE.domain}
            </p>
            <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginTop: 20, maxWidth: 480 }}>
              {PROFILE.bioShort}
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 34, pointerEvents: "auto", flexWrap: "wrap" }}>
              <button className="cv-btn" style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${C.teal}`, color: C.teal, padding: "13px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                <Download size={15} /> Download CV
              </button>
              <button onClick={() => scrollTo("contact")} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, padding: "13px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, cursor: "pointer" }}>
                Get in touch
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: C.mutedDim, marginTop: 16, fontFamily: "'JetBrains Mono', monospace" }}>
              drag the graph — each node is a skill →
            </p>
          </div>
        </div>
        <button onClick={() => scrollTo("about")} style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "none", border: "none", color: C.mutedDim, cursor: "pointer", zIndex: 2 }}>
          <ChevronDown size={22} style={{ animation: "bounce 2s infinite" }} />
        </button>
      </section>

      {/* ABOUT */}
      <SectionShell id="about">
        <Reveal>
          <CommentHeader index="02" label="about" title="About Me" />
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 60 }}>
          <Reveal delay={80}>
            <div className="about-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40 }}>
              <div>
                <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15.5 }}>{PROFILE.bioShort}</p>
                <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15.5, marginTop: 16 }}>{PROFILE.bioLong}</p>
              </div>
              <div style={{ borderLeft: `1px solid ${C.line}`, paddingLeft: 32, fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5 }}>
                {[
                  ["role", `${PROFILE.role} @ ${PROFILE.company}`],
                  ["degree", PROFILE.degree],
                  ["email", PROFILE.email],
                  ["phone", PROFILE.phone],
                  ["birthday", PROFILE.birthday],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: `1px solid ${C.lineSoft}`, color: C.muted }}>
                    <span style={{ color: C.mutedDim }}>{k}:</span>
                    <span style={{ color: C.text, textAlign: "right", overflowWrap: "anywhere" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Philosophy + Connect */}
          <Reveal delay={160}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <div style={{ borderLeft: `2px solid ${C.amber}`, paddingLeft: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: C.amber, marginBottom: 8, letterSpacing: "0.03em" }}>PROFESSIONAL PHILOSOPHY</div>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>{PROFILE.philosophy}</p>
              </div>
              <div style={{ borderLeft: `2px solid ${C.teal}`, paddingLeft: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: C.teal, marginBottom: 8, letterSpacing: "0.03em" }}>LET'S CONNECT</div>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>{PROFILE.connect}</p>
              </div>
            </div>
          </Reveal>

          {/* Education timeline */}
          <Reveal delay={140}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
                <GraduationCap size={18} color={C.teal} />
                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: C.text, margin: 0, letterSpacing: "0.03em" }}>EDUCATION</h3>
              </div>
              <div style={{ position: "relative", paddingLeft: 26 }}>
                <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: C.line }} />
                {EDUCATION.map((e) => (
                  <div key={e.title} style={{ position: "relative", marginBottom: 28 }}>
                    <div style={{ position: "absolute", left: -26, top: 4, width: 11, height: 11, borderRadius: "50%", background: C.bg, border: `2px solid ${C.teal}` }} />
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.teal }}>{e.years}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{e.title}</div>
                    <div style={{ color: C.mutedDim, fontSize: 13.5, marginTop: 3 }}>{e.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Experience */}
          <Reveal delay={200}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
                <Briefcase size={18} color={C.amber} />
                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: C.text, margin: 0, letterSpacing: "0.03em" }}>EXPERIENCE</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {EXPERIENCE.map((e) => (
                  <TiltCard key={e.title} style={{ background: C.panel, border: `1px solid ${e.current ? C.teal : C.line}`, padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.title}</div>
                      {e.current && <span style={{ fontSize: 10.5, color: C.bg, background: C.teal, padding: "2px 7px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>CURRENT</span>}
                    </div>
                    <div style={{ color: C.amber, fontSize: 13, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{e.org}</div>
                    <div style={{ color: C.mutedDim, fontSize: 13.5, marginTop: 10, lineHeight: 1.6 }}>{e.detail}</div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      {/* SKILLS */}
      <SectionShell id="skills" alt>
        <Reveal>
          <CommentHeader index="03" label="skills" title="Skills & Stack" />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {SKILLS.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <TiltCard style={{ background: C.panel, border: `1px solid ${C.line}`, padding: "22px 22px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15.5 }}>{s.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.teal, fontSize: 13 }}>{s.level}%</span>
                </div>
                <div style={{ color: C.mutedDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 14 }}>{s.group}</div>
                <div style={{ height: 6, background: C.lineSoft, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${s.level}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.amber})` }} />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* CONTACT */}
      <SectionShell id="contact">
        <Reveal>
          <CommentHeader index="04" label="contact" title="Contact Me" />
        </Reveal>

        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 48, alignItems: "start" }}>
          <Reveal delay={80}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TiltCard style={{ background: C.panel, border: `1px solid ${C.line}`, padding: 22, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, border: `1px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={18} color={C.teal} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.mutedDim, fontFamily: "'JetBrains Mono', monospace" }}>CALL US ON</div>
                  <a href={`tel:${PROFILE.phone.replace(/\s/g, "")}`} style={{ fontSize: 15, fontWeight: 600, textDecoration: "none" }}>{PROFILE.phone}</a>
                </div>
              </TiltCard>
              <TiltCard style={{ background: C.panel, border: `1px solid ${C.line}`, padding: 22, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, border: `1px solid ${C.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mail size={18} color={C.amber} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.mutedDim, fontFamily: "'JetBrains Mono', monospace" }}>EMAIL</div>
                  <a href={`mailto:${PROFILE.email}`} style={{ fontSize: 15, fontWeight: 600, textDecoration: "none", overflowWrap: "anywhere" }}>{PROFILE.email}</a>
                </div>
              </TiltCard>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="social-btn"
                    style={{ width: 42, height: 42, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, transition: "all 0.2s" }}
                    aria-label={s.label}>
                    <s.icon size={17} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <form onSubmit={handleSubmit} style={{ background: C.panel, border: `1px solid ${C.line}`, padding: 28 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.mutedDim, marginBottom: 20 }}>// drop me an email</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Your name" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.text, padding: "12px 14px", fontSize: 14 }} />
                <input required type="email" value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="Your email" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.text, padding: "12px 14px", fontSize: 14 }} />
                <textarea required rows={4} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Your message" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.text, padding: "12px 14px", fontSize: 14, resize: "vertical" }} />
                <button type="submit" disabled={status === "sending"} className="submit-btn" style={{ background: "transparent", border: `1px solid ${C.teal}`, color: C.teal, padding: "13px 20px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13.5, cursor: status === "sending" ? "wait" : "pointer", transition: "all 0.2s", marginTop: 4, opacity: status === "sending" ? 0.6 : 1 }}>
                  {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send"}
                </button>
                {status === "sent" && (
                  <p style={{ fontSize: 12.5, color: C.teal, margin: 0 }}>Message delivered — thanks for reaching out!</p>
                )}
                {status === "error" && FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID") && (
                  <p style={{ fontSize: 11.5, color: C.amber, margin: 0 }}>
                    Form isn't connected yet — add your Formspree endpoint to <code>FORMSPREE_ENDPOINT</code> near the top of the file.
                  </p>
                )}
                {status === "error" && !FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID") && (
                  <p style={{ fontSize: 11.5, color: "#F87171", margin: 0 }}>Something went wrong sending your message — please try again or email me directly.</p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </SectionShell>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: C.mutedDim }}>
        © {new Date().getFullYear()} Abhishek Panda — built with React &amp; three.js
      </footer>
    </div>
  );
}
