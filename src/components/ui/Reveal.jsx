import { cn } from "@/lib/utils";

/**
 * Wraps children in a scroll-reveal container. The `.reveal` class starts the
 * element hidden; useReveal() adds `.is-visible` when it scrolls into view.
 *
 * `delay` staggers items in a grid — pass the array index multiplied by ~60ms.
 */
export function Reveal({ children, delay = 0, className, as: Cmp = "div", ...rest }) {
  return (
    <Cmp
      className={cn("reveal", className)}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Cmp>
  );
}
