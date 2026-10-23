import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Stand-in for a photograph that has not been supplied yet.
 *
 * Rather than a grey box, each tile gets a soft tinted gradient, a faint dot
 * texture and its own icon, so galleries and event cards look designed while
 * real images are still being collected. Swap in a photo by setting `src` on
 * the data item and the parent renders an <img> instead.
 */

const tones = {
  amber: "from-amber-100 via-orange-50 to-amber-200 text-amber-700",
  rose: "from-rose-100 via-pink-50 to-rose-200 text-rose-700",
  sky: "from-sky-100 via-blue-50 to-sky-200 text-sky-700",
  emerald: "from-emerald-100 via-teal-50 to-emerald-200 text-emerald-700",
  violet: "from-violet-100 via-purple-50 to-violet-200 text-violet-700",
  cyan: "from-cyan-100 via-sky-50 to-cyan-200 text-cyan-700",
  slate: "from-slate-100 via-slate-50 to-slate-200 text-slate-600",
  brand: "from-brand-100 via-brand-50 to-brand-200 text-brand-700",
};

export function PlaceholderTile({ icon = "Image", tone = "brand", label, className, children }) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        "bg-gradient-to-br",
        tones[tone] ?? tones.brand,
        className,
      )}
    >
      <div className="bg-dots absolute inset-0 opacity-45" />

      {/* soft highlight sweep for a bit of depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent" />

      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <Icon name={icon} className="h-9 w-9 opacity-80" strokeWidth={1.5} />
        {label ? (
          <span className="font-display text-[11px] font-semibold tracking-[0.1em] uppercase opacity-70">
            {label}
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

/**
 * Renders a real photo when `src` is present, otherwise the placeholder.
 * Keeps every call site free of the same conditional.
 */
export function Media({ src, alt, icon, tone, label, className, imgClassName }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className={cn("h-full w-full object-cover", imgClassName, className)}
      />
    );
  }
  return <PlaceholderTile icon={icon} tone={tone} label={label} className={className} />;
}
