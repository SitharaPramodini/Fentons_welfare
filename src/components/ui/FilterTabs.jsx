import { cn } from "@/lib/utils";

/**
 * Horizontal pill filter. Scrolls sideways on narrow screens rather than
 * wrapping into a tall block.
 *
 * options: array of strings, or [{ value, label, count }]
 */
export function FilterTabs({ options, value, onChange, className, label = "Filter" }) {
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("snap-row -mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-4 py-2 font-display text-[13px] font-semibold",
              "transition-all duration-200",
              active
                ? "border-brand-500 bg-brand-500 text-white shadow-[0_6px_18px_-8px_oklch(0.705_0.178_48/0.8)]"
                : "border-border bg-card text-muted-foreground hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "ml-1.5 text-[11px]",
                  active ? "text-white/75" : "text-muted-foreground/70",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
