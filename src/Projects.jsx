import { useMemo, useState } from "react";
import { ArrowLeft, Github, ExternalLink, Star, Folder } from "lucide-react";
import { C, MONO, HEADER_H } from "./theme";
import { Reveal, BlueprintGrid, ErrorBoundary } from "./ui";
import { Card3D, CardLayer } from "./Card3D";
import ParticleField from "./ParticleField";
import { navigate, ROUTES } from "./useHashRoute";

/* ---------------------------------------------------------------
   PROJECT DATA

   >>> PLACEHOLDER CONTENT — replace with your real projects. <<<
   These entries are scaffolding built around your stack so the page
   has something to render; they are not descriptions of work you've
   actually shipped. Edit the fields below (or delete entries) before
   publishing.

   Fields:
     title     — project name
     tagline   — one line, shown under the title
     detail    — 1–3 sentence description
     tech      — array of tech tags
     group     — used by the filter chips at the top of the page
     year      — shown in the card corner
     status    — "Live" | "In progress" | "Archived" | ""
     repo      — GitHub URL, or "" to hide the button
     demo      — live demo URL, or "" to hide the button
     featured  — true renders the card with the teal accent border
--------------------------------------------------------------- */
export const PROJECTS = [
  {
    title: "Agentic Task Orchestrator",
    tagline: "Multi-step LLM agent with tool use and guardrails",
    detail:
      "An agent runtime that decomposes a goal into steps, calls tools to execute them, and validates each result before moving on. Includes retry policies and an evaluation harness for measuring task completion rates.",
    tech: ["Python", "LLM APIs", "Prompt Engineering"],
    group: "Agentic AI",
    year: "2025",
    status: "In progress",
    repo: "",
    demo: "",
    featured: true,
  },
  {
    title: "Spring Boot REST Platform",
    tagline: "Production-shaped backend service template",
    detail:
      "A layered Spring Boot service with JWT auth, request validation, structured error handling, and a normalized MySQL schema with indexed queries and migrations.",
    tech: ["Java 21", "Spring Boot", "MySQL"],
    group: "Backend",
    year: "2025",
    status: "Live",
    repo: "",
    demo: "",
    featured: false,
  },
  {
    title: "Real-Time Data Pipeline",
    tagline: "Event ingestion with integrity guarantees",
    detail:
      "Streaming ingestion service focused on throughput and correctness — idempotent writes, backpressure handling, and a replayable event log so no record is lost on failure.",
    tech: ["Java 21", "MySQL", "REST"],
    group: "Backend",
    year: "2024",
    status: "Archived",
    repo: "",
    demo: "",
    featured: false,
  },
  {
    title: "Retrieval-Augmented Q&A",
    tagline: "Grounded answers over a private document set",
    detail:
      "Document chunking, embedding, and retrieval layered under an LLM so answers cite their sources. Built to compare retrieval strategies against a fixed evaluation set.",
    tech: ["Python", "Embeddings", "Prompt Engineering"],
    group: "Agentic AI",
    year: "2025",
    status: "In progress",
    repo: "",
    demo: "",
    featured: false,
  },
  {
    title: "This Portfolio",
    tagline: "React + Vite site with a custom Three.js skill graph",
    detail:
      "A dependency-light single-page portfolio. The hero is a hand-rolled Three.js node graph with HTML labels projected into screen space each frame — no scene-graph framework involved.",
    tech: ["React", "Vite", "Three.js"],
    group: "Frontend",
    year: "2025",
    status: "Live",
    repo: "",
    demo: "",
    featured: false,
  },
];

const STATUS_COLOR = {
  Live: C.teal,
  "In progress": C.amber,
  Archived: C.mutedDim,
};

/* ---------------------------------------------------------------
   PROJECTS PAGE — rendered as its own route (#/projects), NOT as a
   section of the home page, so it never appears while scrolling.
--------------------------------------------------------------- */
export default function Projects() {
  const [filter, setFilter] = useState("All");

  const groups = useMemo(
    () => ["All", ...Array.from(new Set(PROJECTS.map((p) => p.group)))],
    []
  );

  const visible = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.group === filter)),
    [filter]
  );

  return (
    <main style={{ paddingTop: HEADER_H, position: "relative", background: C.bg }}>
      {/* interactive 3D constellation, behind everything on this page */}
      <ErrorBoundary fallback={null}>
        <ParticleField />
      </ErrorBoundary>

      {/* PAGE HEADER */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "32px 24px 56px",
          overflow: "hidden",
        }}
      >
        <BlueprintGrid opacity={0.22} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="back-link"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, background: "none",
              border: "none", padding: 0, marginBottom: 26, cursor: "pointer",
              fontFamily: MONO, fontSize: 13, color: C.mutedDim, transition: "color 0.2s",
            }}
          >
            <ArrowLeft size={15} /> Back to home
          </button>

          <h1
            style={{
              fontFamily: MONO,
              fontSize: "clamp(34px, 5.5vw, 54px)",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
              color: C.text,
            }}
          >
            Projects
          </h1>
          <div style={{ width: 56, height: 3, background: C.teal, marginTop: 16 }} />
          <p
            style={{
              color: C.muted,
              fontSize: 15.5,
              lineHeight: 1.75,
              marginTop: 22,
              maxWidth: 620,
            }}
          >
            Things I've built across backend engineering and applied GenAI — from
            Spring Boot services and MySQL schemas to LLM agents that plan, use
            tools, and act. Each entry links to its source where available.
          </p>

          {/* FILTER CHIPS */}
          <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
            {groups.map((g) => {
              const active = g === filter;
              return (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`filter-chip${active ? " is-active" : ""}`}
                  style={{
                    background: active ? C.teal : "transparent",
                    border: `1px solid ${active ? C.teal : C.line}`,
                    color: active ? C.bg : C.muted,
                    padding: "8px 16px",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {g}
                  <span style={{ opacity: 0.6, marginLeft: 7 }}>
                    {g === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.group === g).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECT GRID */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "10px 24px 110px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            {visible.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 70}>
                <Card3D
                  style={{
                    background: C.panel,
                    border: `1px solid ${p.featured ? C.teal : C.line}`,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* card top row */}
                  <CardLayer depth={18} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <Folder size={17} color={p.featured ? C.teal : C.mutedDim} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {p.featured && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: C.teal }}>
                          <Star size={11} /> FEATURED
                        </span>
                      )}
                      <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mutedDim }}>{p.year}</span>
                    </div>
                  </CardLayer>

                  <CardLayer depth={38}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: "16px 0 0", color: C.text }}>
                      {p.title}
                    </h3>
                  </CardLayer>

                  <CardLayer depth={30}>
                    <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.amber, marginTop: 6 }}>
                      {p.tagline}
                    </div>
                  </CardLayer>

                  <CardLayer depth={16} style={{ flexGrow: 1 }}>
                    <p style={{ color: C.mutedDim, fontSize: 13.5, lineHeight: 1.65, margin: "14px 0 0" }}>
                      {p.detail}
                    </p>
                  </CardLayer>

                  {/* tech tags */}
                  <CardLayer depth={24} style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 18 }}>
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          color: C.muted,
                          border: `1px solid ${C.lineSoft}`,
                          background: C.panelAlt,
                          padding: "3px 9px",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </CardLayer>

                  {/* footer: status + links */}
                  <CardLayer
                    depth={12}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.lineSoft}`,
                    }}
                  >
                    {p.status ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 11.5, color: STATUS_COLOR[p.status] ?? C.mutedDim }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[p.status] ?? C.mutedDim, display: "inline-block" }} />
                        {p.status}
                      </span>
                    ) : <span />}

                    <div style={{ display: "flex", gap: 8 }}>
                      {p.repo && (
                        <a
                          href={p.repo} target="_blank" rel="noopener noreferrer" className="project-link"
                          aria-label={`${p.title} source code on GitHub`}
                          style={{ width: 32, height: 32, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, transition: "all 0.2s" }}
                        >
                          <Github size={15} />
                        </a>
                      )}
                      {p.demo && (
                        <a
                          href={p.demo} target="_blank" rel="noopener noreferrer" className="project-link"
                          aria-label={`${p.title} live demo`}
                          style={{ width: 32, height: 32, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, transition: "all 0.2s" }}
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </CardLayer>
                </Card3D>
              </Reveal>
            ))}
          </div>

          {visible.length === 0 && (
            <p style={{ fontFamily: MONO, fontSize: 13.5, color: C.mutedDim, textAlign: "center", padding: "60px 0" }}>
              No projects in this category yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
