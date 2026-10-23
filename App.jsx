import { useEffect } from "react";
import { RouterProvider, ScrollManager, useRoute, useRoutePath } from "@/router";
import { useReveal } from "@/hooks/useReveal";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Benefits } from "@/pages/Benefits";
import { Membership } from "@/pages/Membership";
import { Photos } from "@/pages/Photos";
import { NotFound } from "@/pages/NotFound";
import { society } from "@/data/society";

/**
 * Route table — one page per part of the Reformed Constitution.
 *
 * Adding a page means adding a line here and one in `navItems`
 * (src/components/layout/Header.jsx).
 */
const routes = {
  "/": { Page: Home, title: "Home" },
  "/about": { Page: About, title: "The Society" },
  "/benefits": { Page: Benefits, title: "Benefits and Facilities" },
  "/membership": { Page: Membership, title: "Membership" },
  "/photos": { Page: Photos, title: "Photos" },
};

/**
 * Where the old pages went. Bookmarks and already-circulated links keep
 * working; pages whose content the Constitution does not cover land on the
 * clause that replaced them.
 */
const redirects = {
  "/services": "/benefits",
  "/clubs": "/benefits#other",
  "/employees": "/membership#cessation",
  "/celebrations": "/photos",
  "/gallery": "/photos",
  "/news": "/photos",
  "/events": "/photos",
  "/members": "/about#office-bearers",
  "/register": "/membership",
  "/contact": "/about#committee",
};

function Shell() {
  const path = useRoutePath();
  const { navigate } = useRoute();

  const redirect = redirects[path];
  const route = routes[path];
  const Page = route?.Page ?? NotFound;

  /* Send retired URLs to whichever page absorbed them. */
  useEffect(() => {
    if (redirect) navigate(redirect);
  }, [redirect, navigate]);

  /* Re-arm the scroll-reveal observer for whatever the new page just mounted. */
  useReveal(path);

  useEffect(() => {
    document.title = route
      ? `${route.title} · ${society.name}`
      : `Page not found · ${society.name}`;
  }, [route]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="flex-1">
        {redirect ? null : <Page />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <ScrollManager />
      <Shell />
    </RouterProvider>
  );
}
