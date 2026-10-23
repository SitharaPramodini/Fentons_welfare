import { useEffect } from "react";

/**
 * Fades `.reveal` elements in as they scroll into view by adding `.is-visible`.
 * Re-runs whenever `key` changes so freshly mounted pages are picked up.
 */
export function useReveal(key) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".reveal:not(.is-visible)"));
    if (nodes.length === 0) return;

    // No IntersectionObserver (or reduced motion) — just show everything.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [key]);
}
