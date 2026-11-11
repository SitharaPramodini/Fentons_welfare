import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { observeReveal } from "@/lib/reveal";

/**
 * Fades its children in when they scroll into view.
 *
 * The element registers itself on mount, so content that appears after the
 * page has loaded - search results, a profile fetched from the API - reveals
 * just like content that was there from the start.
 *
 * `delay` staggers items in a grid: pass the array index multiplied by ~60ms.
 *
 * `as` must be a plain DOM tag ("div", "li", …) rather than a component, so
 * the ref reaches a real element.
 */
export function Reveal({ children, delay = 0, className, as: Cmp = "div", ...rest }) {
  const node = useRef(null);

  useEffect(() => observeReveal(node.current), []);

  return (
    <Cmp
      ref={node}
      className={cn("reveal", className)}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Cmp>
  );
}
