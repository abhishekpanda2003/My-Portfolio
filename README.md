# Portfolio App

A React + Vite personal portfolio website built with a custom 3D skill graph using Three.js.

## Project structure

- `index.html` — application shell
- `src/main.jsx` — React application entry point
- `src/App.jsx` — portfolio UI, layout, and custom 3D graph
- `vite.config.js` — Vite configuration
- `package.json` — dependencies and scripts

## Scripts

- `npm install` — install dependencies
- `npm run dev` — start the local development server
- `npm run build` — build production assets
- `npm run preview` — preview the production build locally

## Notes

- The Vite base path is now configured as `./` by default for compatibility with root and subdirectory deployments.
- Contact form submissions use Formspree and require a valid form endpoint in `src/App.jsx`.

## Deployment

This app can be deployed to Vercel, GitHub Pages, or any static hosting provider.

For GitHub Pages, set `VITE_BASE=/My-Portfolio/` before building if the app is served from a subpath.
