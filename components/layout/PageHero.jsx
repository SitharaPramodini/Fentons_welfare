import { cn } from "@/lib/utils";
import { Link } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { BrushEdge, Eyebrow } from "@/components/ui/primitives";

/**
 * Banner at the top of every inner page: breadcrumb, eyebrow, title, lead and
 * optional quick-jump links to sections further down the page.
 */
export function PageHero({ eyebrow, eyebrowIcon, title, lead, breadcrumb, jumpLinks, children }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900">
      {/* decorative rings + dotted field */}
      <div className="bg-dots-gold absolute inset-0 opacity-25" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full border border-gold-400/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-40 h-96 w-96 rounded-full border border-gold-400/10"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-6 sm:pt-12 sm:pb-24 lg:px-8">
        {breadcrumb ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[13px] text-white/50">
              <li>
                <Link to="/" className="transition hover:text-gold-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="ChevronRight" className="h-3.5 w-3.5 opacity-50" />
              </li>
              <li className="font-medium text-gold-300">{breadcrumb}</li>
            </ol>
          </nav>
        ) : null}

        {eyebrow ? (
          <Eyebrow icon={eyebrowIcon} invert>
            {eyebrow}
          </Eyebrow>
        ) : null}

        <h1
          className={cn(
            "text-balance font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>

        {lead ? (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-[17px]">
            {lead}
          </p>
        ) : null}

        {jumpLinks?.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {jumpLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2",
                  "font-display text-[13px] font-semibold text-white/85 backdrop-blur-sm",
                  "transition-all duration-200 hover:border-gold-400/60 hover:bg-gold-400 hover:text-brand-950 hover:-translate-y-0.5",
                )}
              >
                {link.icon ? <Icon name={link.icon} className="h-3.5 w-3.5" /> : null}
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}

        {children}
      </div>

      <BrushEdge />
    </section>
  );
}
