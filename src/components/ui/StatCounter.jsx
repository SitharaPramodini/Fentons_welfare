import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Counts a number up once, when it first scrolls into view.
 * Honours prefers-reduced-motion by jumping straight to the final value.
 */
function useCountUp(target, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const jump = () => {
      started.current = true;
      setValue(target);
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      jump();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const start = performance.now();
        let frame;

        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          // easeOutCubic — fast at first, settles gently on the final number
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        node._cancelCount = () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      node._cancelCount?.();
    };
  }, [target, duration]);

  return [value, ref];
}

/** `dark` restyles the counter for the ink-coloured stats band on the home page. */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  icon,
  dark = false,
  className,
}) {
  const [shown, ref] = useCountUp(value);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      {icon ? (
        <span
          className={cn(
            "mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border",
            dark
              ? "border-white/20 bg-white/10 text-brand-300"
              : "border-brand-200 bg-brand-50 text-brand-600",
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
      ) : null}

      <div
        className={cn(
          "font-display text-4xl font-extrabold tracking-tight sm:text-5xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        <span className={dark ? "text-brand-400" : "text-brand-600"}>{prefix}</span>
        {shown.toLocaleString("en-US")}
        <span className={dark ? "text-brand-400" : "text-brand-600"}>{suffix}</span>
      </div>

      <div
        className={cn("mt-2 text-sm font-medium", dark ? "text-white/60" : "text-muted-foreground")}
      >
        {label}
      </div>
    </div>
  );
}
