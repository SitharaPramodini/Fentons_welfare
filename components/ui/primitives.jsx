/**
 * Shared building blocks used across every page: layout wrappers, buttons,
 * badges, cards and the accent colour map.
 */
import { cn } from "@/lib/utils";
import { Link } from "@/router";
import { Icon } from "@/components/ui/Icon";

/* --- Accent colours -----------------------------------------------------
 * Data files set `accent` / `tone` to one of these keys. Keeping the full
 * class strings here (rather than building them with template literals) means
 * Tailwind's scanner can see them.
 * --------------------------------------------------------------------- */

export const accents = {
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    grad: "from-amber-400 to-orange-500",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    grad: "from-rose-400 to-pink-500",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    ring: "ring-sky-200",
    dot: "bg-sky-500",
    grad: "from-sky-400 to-blue-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    grad: "from-emerald-400 to-teal-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
    grad: "from-violet-400 to-purple-500",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    ring: "ring-cyan-200",
    dot: "bg-cyan-500",
    grad: "from-cyan-400 to-sky-500",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    ring: "ring-slate-200",
    dot: "bg-slate-500",
    grad: "from-slate-400 to-slate-600",
  },
  brand: {
    bg: "bg-brand-50",
    text: "text-brand-700",
    border: "border-brand-200",
    ring: "ring-brand-200",
    dot: "bg-brand-500",
    grad: "from-brand-400 to-brand-600",
  },
  gold: {
    bg: "bg-gold-50",
    text: "text-gold-800",
    border: "border-gold-200",
    ring: "ring-gold-200",
    dot: "bg-gold-500",
    grad: "from-gold-300 to-gold-500",
  },
  forest: {
    bg: "bg-brand-900",
    text: "text-gold-300",
    border: "border-brand-700",
    ring: "ring-brand-700",
    dot: "bg-gold-400",
    grad: "from-brand-700 to-brand-900",
  },
};

export function accent(key) {
  return accents[key] ?? accents.brand;
}

/* --- Layout -------------------------------------------------------------- */

export function Container({ className, children, ...rest }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)} {...rest}>
      {children}
    </div>
  );
}

export function Section({ className, id, children, muted = false, ...rest }) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-16 sm:py-20 lg:py-24", muted && "bg-surface", className)}
      {...rest}
    >
      {children}
    </section>
  );
}

/**
 * Small uppercase label that sits above a section heading, led by a leaf.
 * `invert` is for the dark green sections.
 */
export function Eyebrow({ children, className, icon = "Sprout", invert = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.16em] uppercase",
        invert ? "text-gold-300" : "text-brand-700",
        className,
      )}
    >
      {icon ? (
        <Icon
          name={icon}
          className={cn("h-4 w-4 shrink-0", invert ? "text-gold-400" : "text-gold-600")}
        />
      ) : null}
      {children}
    </span>
  );
}

/**
 * Torn paper / brush edge between a dark section and the page behind it.
 * `position` says which side of the section it sits on.
 */
export function BrushEdge({ className, position = "bottom", tone = "text-background" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 z-1 h-6 sm:h-9",
        position === "top" ? "top-0" : "bottom-0",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className={cn("h-full w-full", tone, position === "top" && "rotate-180")}
      >
        <path
          fill="currentColor"
          d="M0 40V21.9C20 22.1 80 23.5 120 23C160 22.5 200 19.9 240 18.9C280 17.9 320 17.8 360 17.2C400 16.6 440 16 480 15.3C520 14.6 560 11.7 600 12.9C640 14.1 680 20.6 720 22.5C760 24.4 800 24.8 840 24.5C880 24.2 920 22.7 960 20.9C1000 19.1 1040 14.7 1080 13.6C1120 12.4 1160 13.1 1200 14.1C1240 15 1280 18.4 1320 19.1C1360 19.8 1420 18.5 1440 18.3V40Z"
        />
      </svg>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  lead,
  align = "left",
  invert = false,
  className,
  children,
}) {
  const centered = align === "center";
  return (
    <div className={cn("max-w-3xl", centered && "mx-auto text-center", className)}>
      {eyebrow ? (
        <Eyebrow icon={eyebrowIcon} invert={invert}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      {title ? (
        <h2
          className={cn(
            "text-balance font-display text-3xl font-bold sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]",
            eyebrow && "mt-3",
            invert && "text-white",
          )}
        >
          {title}
        </h2>
      ) : null}
      {lead ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-[17px]",
            invert ? "text-white/65" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* --- Button -------------------------------------------------------------- */

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold " +
  "transition-all duration-300 disabled:pointer-events-none disabled:opacity-55 " +
  "whitespace-nowrap cursor-pointer";

/* Gold is the call to action; forest green is the second voice. */
const buttonVariants = {
  primary: "bg-gold-400 text-brand-950 shadow-gold hover:bg-gold-300 hover:-translate-y-0.5",
  secondary: "bg-brand-800 text-white hover:bg-brand-900 hover:-translate-y-0.5",
  outline:
    "border border-brand-300 bg-white/70 text-brand-800 hover:border-brand-600 hover:bg-brand-50 hover:-translate-y-0.5",
  ghost: "text-foreground hover:bg-brand-50 hover:text-brand-800",
  soft: "bg-brand-50 text-brand-800 border border-brand-100 hover:bg-brand-100",
  white: "bg-white text-brand-800 shadow-soft hover:bg-gold-50 hover:-translate-y-0.5",
  /* For use on the dark green ground */
  onDark:
    "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:-translate-y-0.5",
};

/* The trailing arrow sits in its own circle — the signature button detail. */
const badgeTones = {
  primary: "bg-brand-900 text-gold-300",
  secondary: "bg-gold-400 text-brand-950",
  outline: "bg-brand-700 text-white",
  ghost: "bg-brand-100 text-brand-800",
  soft: "bg-brand-700 text-white",
  white: "bg-brand-800 text-gold-300",
  onDark: "bg-gold-400 text-brand-950",
};

/* Extra right padding leaves room for the circled arrow. */
const buttonSizes = {
  sm: "h-9 pl-4 pr-4 text-[13px]",
  md: "h-12 pl-6 pr-6 text-sm",
  lg: "h-14 pl-8 pr-8 text-[15px]",
};

const badgedSizes = {
  sm: "h-9 pl-4 pr-1.5 text-[13px]",
  md: "h-12 pl-6 pr-1.5 text-sm",
  lg: "h-14 pl-8 pr-2 text-[15px]",
};

const badgeSizes = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

export function Button({
  as,
  to,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  iconRight,
  ...rest
}) {
  const badged = Boolean(iconRight);

  const classes = cn(
    buttonBase,
    buttonVariants[variant],
    (badged ? badgedSizes : buttonSizes)[size],
    className,
  );

  const content = (
    <>
      {icon ? <Icon name={icon} className="h-4 w-4 shrink-0" /> : null}
      {children}
      {badged ? (
        <span
          className={cn(
            "ml-1 inline-flex shrink-0 items-center justify-center rounded-full",
            "transition-transform duration-300 group-hover:rotate-45",
            badgeTones[variant] ?? badgeTones.primary,
            badgeSizes[size],
          )}
        >
          <Icon name={iconRight} className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        </span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cn("group", classes)} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cn("group", classes)} {...rest}>
        {content}
      </a>
    );
  }

  const Cmp = as ?? "button";
  return (
    <Cmp className={cn("group", classes)} {...rest}>
      {content}
    </Cmp>
  );
}

/* --- Badge --------------------------------------------------------------- */

export function Badge({ children, tone = "brand", className, icon, size = "md" }) {
  const a = accent(tone);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        a.bg,
        a.text,
        a.border,
        className,
      )}
    >
      {icon ? <Icon name={icon} className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

/* --- Card ---------------------------------------------------------------- */

export function Card({ className, children, hover = true, ...rest }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-soft",
        hover && "hover-lift",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Rounded square tile holding an icon — used at the top of most cards. */
export function IconTile({ name, tone = "brand", className, size = "md" }) {
  const a = accent(tone);
  const dims = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl border",
        dims,
        a.bg,
        a.text,
        a.border,
        className,
      )}
    >
      <Icon name={name} className={icon} />
    </span>
  );
}

/* --- Misc ---------------------------------------------------------------- */

/** Thin orange-to-transparent rule used between sections. */
export function BrandRule({ className }) {
  return (
    <div
      className={cn(
        "h-px w-full bg-gradient-to-r from-brand-300 via-brand-200 to-transparent",
        className,
      )}
    />
  );
}

export function EmptyState({ icon = "Search", title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <IconTile name={icon} tone="slate" size="lg" className="mx-auto" />
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      {text ? <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{text}</p> : null}
    </div>
  );
}
