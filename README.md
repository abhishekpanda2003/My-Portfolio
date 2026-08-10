# Portfolio App

A single-page personal portfolio built with React + Vite, featuring a custom
Three.js skill graph, an interactive particle background, and pointer-driven 3D cards.

No CSS framework, no router, no state library — the only runtime dependencies are
`react`, `react-dom`, `three`, and `lucide-react`.

## Scripts

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm install`     | install dependencies                             |
| `npm run dev`     | start the local development server               |
| `npm run build`   | build production assets into `dist/`             |
| `npm run preview` | preview the production build locally             |
| `npm run brand`   | regenerate favicon + social card from `logo.png` |

## Project structure

```
index.html              application shell, favicon + social preview meta
public/logo.png         source logo lockup — the only file you maintain
public/favicon.png      generated: monogram tab icon
public/og-image.png     generated: link-preview card
scripts/make-brand-assets.cjs  regenerates the two files above
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

## Brand assets

**You maintain one file: `public/logo.png`** — the full lockup (monogram above
the name), a transparent RGBA PNG. Everything else is derived from it.

| Asset                 | Origin     | Used for                                    |
| --------------------- | ---------- | ------------------------------------------- |
| `public/logo.png`     | you        | header monogram (cropped), footer lockup    |
| `public/favicon.png`  | generated  | browser tab icon, apple-touch-icon          |
| `public/og-image.png` | generated  | link previews on Slack, WhatsApp, LinkedIn  |

### Replacing the logo

```bash
# 1. overwrite public/logo.png
npm run brand      # 2. regenerate favicon.png + og-image.png
```

`npm run brand` also prints the correct `MARK_CROP` values — paste them into
`src/App.jsx` if the new logo places the monogram differently.

`scripts/make-brand-assets.cjs` decodes and re-encodes PNGs with Node's built-in
`zlib` rather than pulling in `sharp` or `jimp`, keeping the project free of
native dependencies. It measures the logo's horizontal bands of ink to locate
the monogram automatically, so it adapts to a re-exported logo with different
padding. If the artwork ever gains gradients or multiple colours, replace it
with a real image library rather than extending it.

### Why the derived assets exist

At 16px the "ABHISHEK PANDA" lettering in the full lockup is an illegible
smudge, so the favicon is the **monogram alone**, teal on a transparent
background so it sits directly on the browser's own tab colour. Teal is the one
palette colour legible against both light and dark chrome — the navy of the
source artwork disappears on dark, and the near-white would disappear on light.

`og-image.png` deliberately keeps its navy background: platforms flatten
transparent preview images onto white or black, which would wreck a light-ink
lockup. It's a proper 1200×630 card at the ratio scrapers expect, rather than a
square logo they would letterbox.

### Header crop and recolouring

The header shows only the monogram, scaled up behind a small square window.
`MARK_CROP` in `src/App.jsx` says where it sits inside the source image, as
fractions of width and height — measured from the file, not estimated.

The artwork is dark navy and so is the background, so `.brand-mark` applies
`filter: brightness(0) invert(1)`: `brightness(0)` flattens every colour to
black and `invert(1)` flips it to white, recolouring a monochrome mark whatever
its source colour. The PNG is transparent, so only the artwork is affected.
Delete that rule if you ever supply an already-light logo.

A missing file degrades gracefully — the header falls back to a plain teal
square and the footer logo hides itself, rather than showing broken-image icons.

### Before going live

Make `og:image` and `twitter:image` in `index.html` **absolute** URLs
(`https://your-domain.com/og-image.png`). Most scrapers won't resolve the
relative paths currently there.

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
