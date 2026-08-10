import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Mail, Instagram, Linkedin, Twitter,
  Menu, X, Download, ChevronDown, GraduationCap, Briefcase,
} from "lucide-react";

import { C, MONO, SANS, HEADER_H, FONT_IMPORT } from "./theme";
import { ErrorBoundary, TiltCard, Reveal, CommentHeader, SectionShell } from "./ui";
import { CARD3D_CSS } from "./Card3D";
import ParticleField from "./ParticleField";
import Projects from "./Projects";

/* ---------------------------------------------------------------
   CONTENT — bio, expertise & philosophy sourced from your LinkedIn
   "About" section.
--------------------------------------------------------------- */

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const PROFILE = {
  name: "Abhishek Panda",
  role: "Project Engineer",
  company: "Wipro",
  domain: "GenAI Engineering — Agentic AI",
  university: "KIIT University",
  degree: "B.Tech, Information Technology",
  age: calculateAge("2003-12-22"),
  email: "abhishekpanda2003@gmail.com",
  // one-line hero pitch — the full bio lives in the About section
  pitch:
    "I build modern, responsive websites for small businesses and professionals.",
  bioShort:
    "As a Project Engineer at Wipro, I now work on the GenAI Engineering team, designing and building agentic AI systems — LLM-powered agents that plan, reason, and act autonomously. I started my journey here in Security Intelligence & Assurance (SIA), which shaped how I think about building resilient, trustworthy systems. My technical foundation goes back to KIIT University, where I earned my B.Tech in Information Technology.",
  bioLong:
    "I'm passionate about the intersection of robust software engineering and applied AI. My experience spans building full-stack applications, architecting real-time systems that prioritize performance and data integrity, and now designing agentic workflows that let LLMs reason, use tools, and complete multi-step tasks reliably.",
  philosophy:
    "I believe good agentic systems are engineered, not prompted into existence — reliability, evaluation, and guardrails matter as much as capability. That instinct comes straight from my security background: assume things can fail, and design for it. I enjoy solving complex problems, whether it's orchestrating a multi-agent workflow or optimizing a database schema.",
  connect:
    "I'm always looking to engage with fellow developers, AI engineers, and tech enthusiasts working on agents and applied GenAI. Feel free to reach out!",
};

// NOTE: the WhatsApp entry was removed because a wa.me link embeds the phone
// number in its URL. Re-add it if you're happy publishing the number.
const SOCIALS = [
  { icon: Instagram, url: "https://www.instagram.com/a.b.h.i._22/", label: "Instagram" },
  { icon: Twitter, url: "https://x.com/abp_2203", label: "Twitter" },
  { icon: Linkedin, url: "https://www.linkedin.com/in/abhishekpanda2003/", label: "LinkedIn" },
];

// what I'm available to build — shown as chips under the hero pitch
const SERVICES = [
  "Business websites",
  "Portfolio sites",
  "Landing pages",
  "React apps",
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

const SKILLS = [
  { name: "Java (21)", group: "Backend" },
  { name: "Spring Boot", group: "Backend" },
  { name: "Python", group: "Language" },
  { name: "MySQL", group: "Database" },
  { name: "Prompt Engineering", group: "Agentic AI" },
];

// dedicated node set for the 3D hero graph
const GRAPH_SKILLS = ["Java 21", "Spring Boot", "Python", "MySQL", "Prompt Engineering", "AI Agents"];

/* Nav items — every one scrolls to a section id on this single page. */
const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/* ---------------------------------------------------------------
   CONTACT FORM — powered by Formspree (https://formspree.io).
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
      const dims = { width: mount.clientWidth || 800, height: mount.clientHeight || 600 };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, dims.width / dims.height, 0.1, 100);
      camera.position.set(0, 0, 9);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(dims.width, dims.height);
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
          const x = (v.x * 0.5 + 0.5) * dims.width;
          const y = (-v.y * 0.5 + 0.5) * dims.height;
          const el = labelsRef.current[i];
          if (el) {
            const scale = THREE.MathUtils.clamp(1 - v.z * 0.3, 0.55, 1.15);
            const dropBelow = (i === 0 ? 22 : 16) * scale;
            el.style.transform = `translate(-50%, 0%) translate(${x}px, ${y + dropBelow}px)`;
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
        dims.width = w;
        dims.height = h;
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
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        cursor: "grab",
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0, transparent ${HEADER_H - 8}px, black ${HEADER_H + 78}px)`,
        maskImage: `linear-gradient(to bottom, transparent 0, transparent ${HEADER_H - 8}px, black ${HEADER_H + 78}px)`,
      }}
    >
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
            fontFamily: MONO,
            fontWeight: i === 0 ? 700 : 500,
            color: i === 0 ? C.amber : C.text,
            letterSpacing: "0.02em",
            background: "rgba(10,15,26,0.6)",
            padding: "1px 6px",
            borderRadius: 3,
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
   HOME PAGE — hero, about, projects, skills, contact.
--------------------------------------------------------------- */
function Home({ scrollTo }) {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const heroRef = useRef(null); // particle field punches a hole around this

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
    <main style={{ position: "relative", background: C.bg }}>
      {/* interactive constellation behind the whole page, masked out around
          the hero's 3D sphere so the two never overlap */}
      <ErrorBoundary fallback={null}>
        <ParticleField holeRef={heroRef} />
      </ErrorBoundary>

      {/* HOME / HERO */}
      <section ref={heroRef} id="home" style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: HEADER_H }}>
        <ErrorBoundary fallback={null}>
          <SkillGraph />
        </ErrorBoundary>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 24px", width: "100%", pointerEvents: "none" }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontFamily: MONO, color: C.teal, fontSize: 13, marginBottom: 18, letterSpacing: "0.04em" }}>
              // whoami
            </div>
            <h1 style={{ fontFamily: MONO, fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 800, lineHeight: 1.08, margin: 0, letterSpacing: "-0.02em" }}>
              Abhishek<br />Panda
            </h1>
            <p style={{ fontFamily: MONO, fontSize: "clamp(15px, 2vw, 19px)", color: C.amber, marginTop: 18, fontWeight: 500 }}>
              &gt; {PROFILE.role} @ {PROFILE.company} · {PROFILE.domain}
            </p>
            <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginTop: 20, maxWidth: 480 }}>
              {PROFILE.pitch}
            </p>

            {/* what I'm available to build */}
            <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap", maxWidth: 500 }}>
              {SERVICES.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: MONO,
                    fontSize: 11.5,
                    color: C.teal,
                    border: `1px solid ${C.line}`,
                    background: "rgba(10,15,26,0.55)",
                    padding: "5px 11px",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 30, pointerEvents: "auto", flexWrap: "wrap" }}>
              <a className="cv-btn" href="https://docs.google.com/document/d/1_9myuwsSmQid2T5ee56AJ8-MoUfETkP8SFX7F3TJ72s/export?format=pdf" target="_blank" rel="noreferrer noopener" download="Abhishek-Panda-Resume.pdf" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${C.teal}`, color: C.teal, padding: "13px 22px", fontFamily: MONO, fontSize: 13.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", textDecoration: "none" }}>
                <Download size={15} /> Download CV
              </a>
              <button onClick={() => scrollTo("contact")} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, padding: "13px 22px", fontFamily: MONO, fontSize: 13.5, cursor: "pointer" }}>
                Get in touch
              </button>
            </div>
          </div>
        </div>
        <button onClick={() => scrollTo("about")} aria-label="Scroll to About" style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "none", border: "none", color: C.mutedDim, cursor: "pointer", zIndex: 2 }}>
          <ChevronDown size={22} className="bounce" />
        </button>
      </section>

      {/* ABOUT */}
      <SectionShell id="about">
        <Reveal>
          <CommentHeader title="About Me" />
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 60 }}>
          <Reveal delay={80}>
            <div className="about-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40 }}>
              <div>
                <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15.5 }}>{PROFILE.bioShort}</p>
                <p style={{ color: C.muted, lineHeight: 1.8, fontSize: 15.5, marginTop: 16 }}>{PROFILE.bioLong}</p>
              </div>
              <div style={{ borderLeft: `1px solid ${C.line}`, paddingLeft: 32, fontFamily: MONO, fontSize: 13.5 }}>
                {[
                  ["role", `${PROFILE.role} @ ${PROFILE.company}`],
                  ["degree", PROFILE.degree],
                  ["email", PROFILE.email],
                  ["age", PROFILE.age],
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
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.amber, marginBottom: 8, letterSpacing: "0.03em" }}>PROFESSIONAL PHILOSOPHY</div>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>{PROFILE.philosophy}</p>
              </div>
              <div style={{ borderLeft: `2px solid ${C.teal}`, paddingLeft: 20 }}>
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.teal, marginBottom: 8, letterSpacing: "0.03em" }}>LET'S CONNECT</div>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>{PROFILE.connect}</p>
              </div>
            </div>
          </Reveal>

          {/* Education timeline */}
          <Reveal delay={140}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
                <GraduationCap size={18} color={C.teal} />
                <h3 style={{ fontFamily: MONO, fontSize: 15, color: C.text, margin: 0, letterSpacing: "0.03em" }}>EDUCATION</h3>
              </div>
              <div style={{ position: "relative", paddingLeft: 26 }}>
                <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: C.line }} />
                {EDUCATION.map((e) => (
                  <div key={e.title} style={{ position: "relative", marginBottom: 28 }}>
                    <div style={{ position: "absolute", left: -26, top: 4, width: 11, height: 11, borderRadius: "50%", background: C.bg, border: `2px solid ${C.teal}` }} />
                    <div style={{ fontFamily: MONO, fontSize: 12, color: C.teal }}>{e.years}</div>
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
                <h3 style={{ fontFamily: MONO, fontSize: 15, color: C.text, margin: 0, letterSpacing: "0.03em" }}>EXPERIENCE</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {EXPERIENCE.map((e) => (
                  <TiltCard key={e.title} style={{ background: C.panel, border: `1px solid ${e.current ? C.teal : C.line}`, padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.title}</div>
                      {e.current && <span style={{ fontSize: 10.5, color: C.bg, background: C.teal, padding: "2px 7px", fontFamily: MONO, fontWeight: 700 }}>CURRENT</span>}
                    </div>
                    <div style={{ color: C.amber, fontSize: 13, marginTop: 4, fontFamily: MONO }}>{e.org}</div>
                    <div style={{ color: C.mutedDim, fontSize: 13.5, marginTop: 10, lineHeight: 1.6 }}>{e.detail}</div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      {/* PROJECTS */}
      <Projects />

      {/* SKILLS */}
      <SectionShell id="skills">
        <Reveal>
          <CommentHeader title="Skills & Stack" />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
          {SKILLS.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <TiltCard style={{ background: C.panel, border: `1px solid ${C.line}`, padding: "20px 20px 18px" }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{s.name}</div>
                <div style={{ color: C.mutedDim, fontSize: 12, fontFamily: MONO, marginTop: 6 }}>{s.group}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* CONTACT */}
      <SectionShell id="contact" alt>
        <Reveal>
          <CommentHeader title="Contact Me" />
        </Reveal>

        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 48, alignItems: "start" }}>
          <Reveal delay={80}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TiltCard style={{ background: C.panel, border: `1px solid ${C.line}`, padding: 22, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, border: `1px solid ${C.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mail size={18} color={C.amber} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.mutedDim, fontFamily: MONO }}>EMAIL</div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  aria-label="Your name"
                  placeholder="Your name" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.text, padding: "12px 14px", fontSize: 14 }} />
                <input required type="email" value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  aria-label="Your email"
                  placeholder="Your email" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.text, padding: "12px 14px", fontSize: 14 }} />
                <textarea required rows={4} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  aria-label="Your message"
                  placeholder="Your message" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.text, padding: "12px 14px", fontSize: 14, resize: "vertical" }} />
                <button type="submit" disabled={status === "sending"} className="submit-btn" style={{ background: "transparent", border: `1px solid ${C.teal}`, color: C.teal, padding: "13px 20px", fontFamily: MONO, fontWeight: 700, fontSize: 13.5, cursor: status === "sending" ? "wait" : "pointer", transition: "all 0.2s", marginTop: 4, opacity: status === "sending" ? 0.6 : 1 }}>
                  {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send"}
                </button>
                {status === "sent" && (
                  <p style={{ fontSize: 12.5, color: C.teal, margin: 0 }}>Message delivered — thanks for reaching out!</p>
                )}
                {status === "error" && (
                  <p style={{ fontSize: 11.5, color: "#F87171", margin: 0 }}>Something went wrong sending your message — please try again or email me directly.</p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </SectionShell>
    </main>
  );
}

/* ---------------------------------------------------------------
   ROOT — global styles, header, page, footer.
   Single page: every nav item scrolls to a section.
--------------------------------------------------------------- */
export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    // the hero already reserves header height, so send it to the very top
    // instead of leaving a header-sized band above it
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: SANS, minHeight: "100vh" }}>
      <style>{`
        ${FONT_IMPORT}
        html, body, #root {
          margin: 0;
          min-height: 100%;
          background: ${C.bg};
          color: ${C.text};
        }
        /* hide the scrollbars without disabling scrolling */
        html, body {
          overflow-x: hidden;
          scrollbar-width: none;      /* Firefox */
          -ms-overflow-style: none;   /* legacy Edge */
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar { width: 0; height: 0; display: none; }
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: ${SANS}; }
        a { color: inherit; }
        section { scroll-margin-top: ${HEADER_H}px; }
        input, textarea { font-family: ${SANS}; }
        input:focus, textarea:focus { outline: 2px solid ${C.teal}; outline-offset: 2px; }
        ::selection { background: ${C.teal}; color: ${C.bg}; }
        .nav-link:hover { color: ${C.teal} !important; }
        .social-btn:hover { border-color: ${C.teal} !important; color: ${C.teal} !important; transform: translateY(-2px); }
        .cv-btn:hover { background: ${C.teal} !important; color: ${C.bg} !important; }
        .submit-btn:hover { background: ${C.amber} !important; border-color: ${C.amber} !important; color: ${C.bg} !important; }
        .filter-chip:not(.is-active):hover { border-color: ${C.teal} !important; color: ${C.teal} !important; }
        .project-link:hover { border-color: ${C.teal} !important; color: ${C.teal} !important; transform: translateY(-2px); }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-7px); }
          60% { transform: translateY(-4px); }
        }
        .bounce { animation: bounce 2s infinite; }
        ${CARD3D_CSS}
        @media (max-width: 720px) { .desktop-nav { display: none !important; } .mobile-toggle { display: flex !important; } .contact-grid { grid-template-columns: 1fr !important; } .about-info-grid { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
      `}</style>

      {/* NAV */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(10,15,26,0.95)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => scrollTo("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, background: C.teal, display: "inline-block" }} />
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 17, color: C.text }}>abhishek<span style={{ color: C.teal }}>.dev</span></span>
          </button>

          <nav className="desktop-nav" style={{ display: "flex", gap: 32 }}>
            {NAV.map((item) => (
              <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 13, color: C.muted, letterSpacing: "0.03em" }}>
                {item.label}
              </button>
            ))}
          </nav>

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} style={{ display: "none", background: "none", border: `1px solid ${C.line}`, padding: 8, color: C.text, cursor: "pointer" }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop: `1px solid ${C.line}`, padding: "12px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((item) => (
              <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)} style={{ textAlign: "left", background: "none", border: "none", padding: "10px 0", color: C.muted, fontFamily: MONO, fontSize: 14, cursor: "pointer" }}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <ErrorBoundary fallback={<div style={{ padding: `${HEADER_H + 80}px 24px`, textAlign: "center", fontFamily: MONO, color: C.muted }}>Something went wrong loading this page.</div>}>
        <Home scrollTo={scrollTo} />
      </ErrorBoundary>

      {/* position/z-index keeps the footer above the fixed particle backdrop,
          while its transparent background lets it show through */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${C.line}`, padding: "28px 24px", textAlign: "center", fontFamily: MONO, fontSize: 12.5, color: C.mutedDim }}>
        © {new Date().getFullYear()} Abhishek Panda — built with React &amp; three.js
      </footer>
    </div>
  );
}
