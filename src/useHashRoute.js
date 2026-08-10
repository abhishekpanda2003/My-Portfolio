import { useEffect, useState } from "react";

/* ---------------------------------------------------------------
   MINIMAL HASH ROUTER

   Why hash routing and not react-router / history API?
   This site is deployed as a purely static bundle (Vercel today,
   GitHub Pages supported via VITE_BASE). Path-based routes like
   "/projects" would 404 on a hard refresh unless the host is
   configured to rewrite every unknown path to index.html. A hash
   route ("#/projects") is never sent to the server, so deep links
   and refreshes work everywhere with zero host config and zero
   extra dependencies.
--------------------------------------------------------------- */

export const ROUTES = { HOME: "home", PROJECTS: "projects" };

const readRoute = () => {
  // "#/projects" -> "projects";  "" | "#" | "#/" -> "home"
  const raw = window.location.hash.replace(/^#\/?/, "").split(/[?&]/)[0];
  return raw === ROUTES.PROJECTS ? ROUTES.PROJECTS : ROUTES.HOME;
};

/** Navigate to a route. Setting the hash fires `hashchange`. */
export function navigate(route) {
  const next = route === ROUTES.HOME ? "#/" : `#/${route}`;
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

/** Current route, kept in sync with back/forward buttons and deep links. */
export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    // catch a hash that changed between first render and effect running
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}
