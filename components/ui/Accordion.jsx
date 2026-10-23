import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Accessible single-open accordion. Used for FAQs and the longer reference
 * lists (loan notes, insurance conditions).
 *
 * items: [{ q, a }] — `a` may be a string or an array of paragraphs.
 */
export function Accordion({ items, className, defaultOpen = -1 }) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();

  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;

        return (
          <div key={item.q ?? i}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left",
                  "font-display text-[15px] font-semibold transition-colors hover:bg-brand-50/60 sm:px-6",
                  isOpen && "bg-brand-50/50 text-brand-800",
                )}
              >
                <span>{item.q}</span>
                <Icon
                  name="ChevronDown"
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 text-brand-500 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </h3>

            {/* Grid-row trick animates height without measuring the content. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
                  {Array.isArray(item.a) ? (
                    item.a.map((p, k) => <p key={k}>{p}</p>)
                  ) : (
                    <p>{item.a}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
