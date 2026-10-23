import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Minimal hash-based router.
 *
 * Hash routing is deliberate: the built site is plain static files, so it can be
 * dropped on any host (IIS, Apache, GitHub Pages, a network share) with no
 * server-side rewrite rules. URLs look like `/#/events`.
 */

const RouteContext = createContext({ path: "/", navigate: () => {} });

function readHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || raw === "/") return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(readHash);

  useEffect(() => {
    const onChange = () => setPath(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to) => {
    const next = to.startsWith("/") ? to : `/${to}`;
    if (readHash() === next) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = next;
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  return useContext(RouteContext);
}

/** Path without any `#section` suffix, e.g. "/events". */
export function useRoutePath() {
  const { path } = useRoute();
  return path.split("#")[0] || "/";
}

/**
 * Internal link. Use `to="/events"` for pages and `to="/#objectives"` to jump
 * to a section. External/mailto/tel links fall through to a plain anchor.
 */
export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate } = useRoute();
  const isExternal = /^(https?:|mailto:|tel:)/.test(to);

  if (isExternal) {
    return (
      <a
        href={to}
        className={className}
        target={to.startsWith("http") ? "_blank" : undefined}
        rel={to.startsWith("http") ? "noreferrer noopener" : undefined}
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * Scrolls to the top on every page change, or to `#section` when the hash
 * carries one (e.g. `/services#loans`).
 */
export function ScrollManager() {
  const { path } = useRoute();

  useEffect(() => {
    const [, section] = path.split("#");

    if (!section) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    // Wait a frame so the new page has mounted before measuring.
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(section);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 92; // sticky header
        window.scrollTo({ top, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });

    return () => cancelAnimationFrame(id);
  }, [path]);

  return null;
}
