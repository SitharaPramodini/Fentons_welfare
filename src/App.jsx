import { useEffect } from "react";
import { RouterProvider, ScrollManager, useRoute, useRoutePath } from "@/router";
import { AuthProvider, useAuth } from "@/context/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Benefits } from "@/pages/Benefits";
import { Membership } from "@/pages/Membership";
import { LoanApplication } from "@/pages/LoanApplication";
import { Photos } from "@/pages/Photos";
import { NotFound } from "@/pages/NotFound";
import { Login } from "@/pages/Login";
import { Profile } from "@/pages/Profile";
import { Employees } from "@/pages/Employees";
import { Admin } from "@/pages/Admin";
import { Records } from "@/pages/Records";
import { Decision } from "@/pages/Decision";
import { society } from "@/data/society";

const routes = {
  "/": { Page: Home, title: "Home" },
  "/about": { Page: About, title: "The Society" },
  "/benefits": { Page: Benefits, title: "Benefits and Facilities" },
  "/membership": { Page: Membership, title: "Membership" },
  /* `private` pages are only reachable with a session. The loan pages are
   * private in full: a visitor is told nothing about the facility. */
  "/loans": { Page: LoanApplication, title: "Apply for a Loan", private: true },
  "/photos": { Page: Photos, title: "Photos" },
  "/login": { Page: Login, title: "Sign in" },
  "/profile": { Page: Profile, title: "My Account", private: true },
  "/employees": { Page: Employees, title: "Eligible Employees", private: true },
  /* `admin` pages need an administrator, not just a session. */
  "/admin": { Page: Admin, title: "The Office", private: true, admin: true },
  "/records": { Page: Records, title: "Records", private: true, admin: true },
};

/* Retired URLs, sent to whichever page absorbed them.
 *
 * A path here must not also be a real route: `/employees` used to redirect to
 * the membership page and kept the new employee list from ever rendering.
 * `routeFor` below now gives a real page priority, so the mistake cannot
 * silently repeat. */
const redirects = {
  "/services": "/benefits",
  "/clubs": "/benefits#other",
  "/celebrations": "/photos",
  "/gallery": "/photos",
  "/news": "/photos",
  "/events": "/photos",
  /* The office bearers live inside the committee section. */
  "/members": "/about#committee",
  "/register": "/membership#apply",
  "/apply": "/membership#apply",
  "/loan": "/loans",
  "/loan-application": "/loans",
  "/contact": "/about#committee",
};

function Shell() {
  const path = useRoutePath();
  const { navigate } = useRoute();
  const { isSignedIn, isAdmin, loading, mustChangePassword } = useAuth();

  /* `/decision/<token>` carries its own authorisation in the URL, so it is
   * matched by prefix and is reachable without signing in. */
  const decisionToken = path.startsWith("/decision/") ? path.slice("/decision/".length) : null;

  const route = decisionToken
    ? { Page: () => <Decision token={decisionToken} />, title: "A decision" }
    : routes[path];

  /* A real page always beats a retired-URL redirect. */
  const redirect = route ? null : redirects[path];
  const Page = route?.Page ?? NotFound;

  /* A private page reached without a session sends the visitor to sign in.
   * `loading` matters: on a refresh the session is confirmed a moment after
   * mount, and without it every private page would bounce to /login first. */
  const blocked = Boolean(route?.private) && !loading && !isSignedIn;

  /* An administration page reached by somebody who is not in the office goes
   * to their own account rather than announcing that the page exists. */
  const notTheOffice = Boolean(route?.admin) && !loading && isSignedIn && !isAdmin;

  useEffect(() => {
    if (blocked) navigate("/login");
  }, [blocked, navigate]);

  useEffect(() => {
    if (notTheOffice) navigate("/profile");
  }, [notTheOffice, navigate]);

  /* Someone still on their issued password finishes that first. */
  const owesPassword = isSignedIn && mustChangePassword && path !== "/login";
  useEffect(() => {
    if (owesPassword) navigate("/login");
  }, [owesPassword, navigate]);

  /* Send retired URLs to whichever page absorbed them. */
  useEffect(() => {
    if (redirect) navigate(redirect);
  }, [redirect, navigate]);

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
        {redirect || blocked || notTheOffice || owesPassword ? null : <Page />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <ScrollManager />
        <Shell />
      </RouterProvider>
    </AuthProvider>
  );
}
