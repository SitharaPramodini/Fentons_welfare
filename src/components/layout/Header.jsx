import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useRoutePath } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/primitives";
import { TopBar } from "@/components/layout/TopBar";
import { Logo } from "@/components/layout/Logo";

/**
 * Four links plus the Constitution. That is the whole navigation.
 *
 * The site covers exactly what the Reformed Constitution covers, so there is
 * no Contact, News, Clubs or Celebrations page — the Constitution records no
 * such details and none are invented.
 */
export const navItems = [
  { label: "Home", to: "/" },
  { label: "The Society", to: "/about" },
  { label: "Benefits", to: "/benefits" },
  { label: "Membership", to: "/membership" },
  { label: "Photos", to: "/photos" },
];

export function Header() {
  const path = useRoutePath();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Solid background + shadow once the page has scrolled past the hero top. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close the mobile drawer whenever the route changes. */
  useEffect(() => setOpen(false), [path]);

  /* Lock body scroll behind the open drawer. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <TopBar />

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/92 shadow-soft backdrop-blur-md"
            : "border-b border-transparent bg-background",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Welfare Society of Fentons — home">
            <Logo />
          </Link>

          {/* Desktop nav — five links fit comfortably from md up */}
          <nav aria-label="Main" className="hidden md:block">
            <ul className="m-0 flex list-none items-center gap-1 rounded-full border border-border bg-surface/80 p-1.5 backdrop-blur-sm">
              {navItems.map((item) => {
                const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-block rounded-full px-4 py-2 font-display text-[14.5px] font-semibold transition-all duration-300",
                        active
                          ? "bg-brand-800 text-white shadow-brand"
                          : "text-foreground/70 hover:bg-brand-50 hover:text-brand-800",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button to="/about" className="hidden sm:inline-flex" iconRight="ArrowUpRight">
              Constitution
            </Button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-ink transition hover:border-brand-400 hover:bg-brand-50 md:hidden"
            >
              <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-0 z-60 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 bg-ink/45 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          className={cn(
            "relative border-b border-border bg-background shadow-2xl",
            "transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "-translate-y-full",
          )}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card"
            >
              <Icon name="X" className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="px-5 pb-6">
            <ul className="m-0 grid list-none gap-1 p-0">
              {navItems.map((item) => {
                const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-full px-5 py-3.5 font-display text-base font-semibold transition-colors",
                        active ? "bg-brand-800 text-white" : "text-foreground hover:bg-surface",
                      )}
                    >
                      {item.label}
                      <Icon name="ChevronRight" className="h-4 w-4 opacity-40" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Button
              to="/about"
              className="mt-5 w-full"
              onClick={() => setOpen(false)}
              iconRight="ArrowRight"
            >
              Read the Constitution
            </Button>
          </nav>
        </div>
      </div>
    </>
  );
}
