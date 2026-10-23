import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Numbered step list with a connecting spine — used for every "how do I…"
 * process on the site (registration, loans, club memberships, claims,
 * resignation).
 *
 * steps: [{ title, text, icon? }]
 */
export function Steps({ steps, className, startAt = 1 }) {
  return (
    <ol className={cn("relative m-0 list-none space-y-5 p-0", className)}>
      {steps.map((step, i) => (
        <Reveal as="li" key={step.title} delay={i * 70} className="relative flex gap-5">
          {/* Spine + numbered node */}
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "relative z-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                "border-2 border-brand-200 bg-white font-display text-sm font-bold text-brand-700 shadow-soft",
              )}
            >
              {step.icon ? (
                <Icon name={step.icon} className="h-5 w-5" />
              ) : (
                String(i + startAt).padStart(2, "0")
              )}
            </span>

            {i < steps.length - 1 ? (
              <span className="mt-1 w-0.5 flex-1 rounded-full bg-gradient-to-b from-brand-200 to-brand-100" />
            ) : null}
          </div>

          <div className="pb-1">
            <h4 className="font-display text-base font-semibold">{step.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/**
 * Horizontal variant for wide sections — the same data, laid out as cards in a
 * row with arrows between them. Falls back to a single column on mobile.
 */
export function StepCards({ steps, className }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {steps.map((step, i) => (
        <Reveal key={step.title} delay={i * 80}>
          <div className="hover-lift relative h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="font-display text-4xl font-extrabold text-brand-100 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="mt-2 font-display text-base font-semibold">{step.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
