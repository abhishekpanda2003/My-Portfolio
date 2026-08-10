# Portfolio App

A React + Vite personal portfolio website built with a custom 3D skill graph using Three.js.

## Project structure

```
index.html            application shell
src/main.jsx          React application entry point
src/App.jsx           global styles, header/footer, and the page itself
src/Projects.jsx      Projects section — project data + filterable card grid
src/Card3D.jsx        pointer-driven 3D card: tilt, cursor glow, parallax layers
src/ParticleField.jsx interactive 3D constellation background
src/ui.jsx            shared UI primitives (ErrorBoundary, TiltCard, Reveal, SectionShell…)
src/theme.js          palette, fonts, and layout tokens shared across the site
vite.config.js        Vite configuration
package.json          dependencies and scripts
```

## Scripts

- `npm install` — install dependencies
- `npm run dev` — start the local development server
- `npm run build` — build production assets
- `npm run preview` — preview the production build locally

## Page structure

The site is a single scrolling page. Sections, in order:

| Section    | Source                            |
| ---------- | --------------------------------- |
| `home`     | hero + 3D skill graph, `App.jsx`  |
| `about`    | bio, education, experience        |
| `projects` | `src/Projects.jsx`                |
| `skills`   | skill bars                        |
| `contact`  | contact cards + Formspree form    |

Every nav item scrolls to a section `id`; there is no router. To add one, add an entry
to the `NAV` array in `src/App.jsx` whose `id` matches a section's `id`, and give that
section a `SectionShell id="…"`.

## Editing content

All content is plain data at the top of its file — no markup editing required.

- **Bio, education, experience, skills, socials** — the `PROFILE`, `EDUCATION`,
  `EXPERIENCE`, `SKILLS`, and `SOCIALS` constants in `src/App.jsx`.
- **Projects** — the `PROJECTS` array in `src/Projects.jsx`. Each entry accepts
  `title`, `tagline`, `detail`, `tech[]`, `group`, `year`, `status`, `repo`, `demo`,
  and `featured`. The filter chips above the grid are generated from `group`, so adding
  a new group needs no other change. Leave `repo` or `demo` as `""` to hide that button.
- **Colors and fonts** — the `C` token object in `src/theme.js` restyles the whole site.

## The 3D project cards

Project cards use `Card3D` from `src/Card3D.jsx`, which layers four pointer-driven
effects: the card tilts toward the cursor, a teal pool of light and a white specular
sheen follow it, a 1px border ring lights up nearest to it, and the card's contents sit
at different `translateZ` depths so the title floats above the background as it tilts.

Depth is set per layer with `<CardLayer depth={38}>` — higher values float further
forward on hover. Tilt strength is the `maxTilt` prop on `Card3D` (default `14` degrees).

The effect is driven entirely by CSS custom properties written to the DOM inside a
`requestAnimationFrame`, so pointer movement never triggers a React re-render. It is
disabled automatically on touch devices (`@media (hover: none)`) and for visitors who
prefer reduced motion.

> The entries currently in `PROJECTS` are placeholder scaffolding built around the
> site's tech stack, not descriptions of shipped work. Replace them before publishing.

## The constellation background

`src/ParticleField.jsx` renders an interactive Three.js constellation behind the whole
page: a drifting cloud of points where any two closer than a threshold are joined by a
line, brightest when nearest — so the mesh continuously forms and dissolves. The field
parallaxes toward the cursor and points are pushed away from it.

It is `position: fixed`, so it stays locked to the viewport for the whole scroll,
including behind the footer. Sections paint above it at `z-index: 1` with see-through
backgrounds so the field shows through.

It takes a `holeRef` pointing at the hero. A radial mask punches a clear circle around
that element so the particles surround the 3D skill graph instead of showing through
it, and the hole tracks the hero's on-screen position as you scroll, travelling
off-screen naturally once you pass it. Omit `holeRef` for an unmasked field.

> The fixed positioning depends on no ancestor setting `transform`, `filter`,
> `perspective`, `contain`, or `will-change` — any of those re-anchor a fixed element
> to that ancestor and the background will stop tracking the viewport.

Tuning constants live at the top of the file: `COUNT` (particles — pair checks are
O(n²), so raise it carefully), `MAX_LINES`, `CAMERA_Z`, and `FOV`.

It is deliberately cheap: the line buffer is allocated once at max size and only its
used span is rewritten each frame, the loop pauses when the tab is hidden, and the
canvas is `pointer-events: none` with pointer tracking on `window`, so it never
intercepts clicks. Under `prefers-reduced-motion` it renders a single static frame,
and if WebGL is unavailable the page renders normally without it.

## Notes

- The Vite base path is `./` by default for compatibility with root and subdirectory deployments.
- Contact form submissions use Formspree; the endpoint lives in `FORMSPREE_ENDPOINT` in `src/App.jsx`.
- The production bundle triggers a Vite "chunk larger than 500 kB" advisory. It is
  informational only — the size comes from `three`, and the build and deployment succeed.

## Deployment

This app can be deployed to Vercel, GitHub Pages, or any static hosting provider.

For GitHub Pages, set `VITE_BASE=/My-Portfolio/` before building if the app is served from a subpath.
