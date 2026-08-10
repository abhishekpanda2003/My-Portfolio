# Portfolio App

A single-page personal portfolio built with React + Vite, featuring a custom
Three.js skill graph, an interactive particle background, and pointer-driven 3D cards.

No CSS framework, no router, no state library — the only runtime dependencies are
`react`, `react-dom`, `three`, and `lucide-react`.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm install`     | install dependencies                  |
| `npm run dev`     | start the local development server    |
| `npm run build`   | build production assets into `dist/`  |
| `npm run preview` | preview the production build locally  |

## Project structure

```
index.html              application shell
src/main.jsx            React entry point
src/App.jsx             content data, hero skill graph, all page sections, header/footer
src/Projects.jsx        Projects section — project data + filterable card grid
src/theme.js            design tokens: palette, fonts, layout constants
src/ui.jsx              shared primitives: ErrorBoundary, TiltCard, Reveal, SectionShell
src/Card3D.jsx          project-card 3D effect: tilt, cursor glow, parallax layers
src/ParticleField.jsx   fixed constellation background (Three.js)
src/Wireframe3D.jsx     rotating torus-knot wireframe beside the education timeline
vite.config.js          Vite configuration
```

`App.jsx` is organised into four numbered blocks — content data, the skill graph,
the page sections, and the root shell — with a map of them in the file header.

## Page structure

One scrolling page. Every nav item scrolls to a section `id`; there is no router.

| Section    | Lives in                             |
| ---------- | ------------------------------------ |
| `home`     | hero + 3D skill graph, `App.jsx`     |
| `about`    | bio, education timeline, experience  |
| `projects` | `src/Projects.jsx`                   |
| `skills`   | skill cards                          |
| `contact`  | contact card + Formspree form        |

To add a section: give it a `<SectionShell id="…">` and add a matching entry to
the `NAV` array in `App.jsx`.

## Editing content

All copy is plain data — no markup editing required.

- **Bio, education, experience, skills, socials, services** — the `PROFILE`,
  `EDUCATION`, `EXPERIENCE`, `SKILLS`, `SOCIALS`, and `SERVICES` constants at the
  top of `src/App.jsx`.
- **Projects** — the `PROJECTS` array in `src/Projects.jsx`. Each entry takes
  `title`, `tagline`, `detail`, `tech[]`, `group`, `year`, `status`, `repo`,
  `demo`, and `featured`. The filter chips are generated from `group`, so adding
  a new group needs no other change; leave `repo` or `demo` as `""` to hide that
  button.
- **Colours and fonts** — the tokens in `src/theme.js` restyle the whole site.

> The entries in `PROJECTS` are placeholder scaffolding built around the site's
> tech stack, not descriptions of shipped work. Replace them before publishing.

## The 3D pieces

Three separate effects, each isolated in its own file.

**`Card3D.jsx`** — project cards tilt toward the cursor while a teal glow, a white
specular sheen, and a lit border ring follow it. Card contents sit at different
`translateZ` depths (`<CardLayer depth={38}>`) so the title floats above the
background as it tilts. Driven entirely by CSS custom properties written inside a
`requestAnimationFrame`, so pointer movement never re-renders React.

**`ParticleField.jsx`** — a drifting cloud of points where any two closer than a
threshold are joined by a line, brightest when nearest, so the mesh continuously
forms and dissolves. It parallaxes toward the cursor and pushes points away from
it. Tuning constants sit at the top of the file: `COUNT` (pair checks are O(n²),
so raise it carefully), `MAX_LINES`, `CAMERA_Z`, `FOV`.

It takes a `holeRef` pointing at the hero's skill-graph canvas. A radial mask
punches a clear circle around that element so particles surround the sphere
rather than showing through it, and the hole tracks the canvas's on-screen
position as you scroll.

**`Wireframe3D.jsx`** — a rotating torus knot filling the column beside the
education timeline. Deliberately a **2D canvas**, not Three.js: the page already
runs two WebGL contexts, and a few hundred hand-projected line segments cost far
less than a third. `height` sizes it; `P`/`Q` at the top of the file change the
knot shape.

### Constraints worth knowing

- `ParticleField` is `position: fixed`. **No ancestor may set `transform`,
  `filter`, `perspective`, `contain`, or `will-change`** — any of those re-anchor
  a fixed element to that ancestor and the background stops tracking the viewport.
- Sections paint above the background at `z-index: 1` with transparent
  backgrounds, so the field reads identically from top to bottom.
- Every effect degrades: all are disabled or frozen under
  `prefers-reduced-motion`, `Card3D` switches off where there's no hover
  (`@media (hover: none)`), and the WebGL pieces are wrapped in `ErrorBoundary`
  so a missing WebGL context can't blank the page.
- The WebGL and canvas loops pause when the tab is hidden; `Wireframe3D` also
  pauses when scrolled out of view.

## Layout notes

- **Header offset.** `HEADER_H` in `theme.js` is only an estimate. `Portfolio()`
  measures the real header on mount and publishes it as the `--header-h` CSS
  variable, which `scroll-margin-top` uses so a nav click parks each section's
  top border flush against the header.
- **Scroll reveals.** `Reveal` in `ui.jsx` animates on the way *down* only. It
  reveals at 15% visibility but re-arms only once an element is completely below
  the viewport, so scrolling up never replays the fade.
- **The hero graph** sits in the right-hand column on desktop (`.skill-graph
  { left: 42% }`) to keep clear of the copy, and dims to a backdrop below 900px
  where the text spans the full width.

## Deployment

Deploys as a static bundle to Vercel, GitHub Pages, or any static host.

The Vite `base` is `./` by default, which works from both a root domain and a
subdirectory. For GitHub Pages served from a subpath, build with
`VITE_BASE=/My-Portfolio/`.

Contact form submissions go through Formspree; the endpoint is
`FORMSPREE_ENDPOINT` in `src/App.jsx`.

> The production build prints a Vite "chunk larger than 500 kB" advisory. It is
> informational only — the size is `three`, and the build and deploy succeed.
