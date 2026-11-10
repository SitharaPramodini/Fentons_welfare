/**
 * The scroll-reveal observer, shared by every `<Reveal>` on the page.
 *
 * `.reveal` starts at `opacity: 0` and is shown by adding `.is-visible`. This
 * used to be armed once per route change, which meant anything that arrived
 * later — search results, a profile loaded from the API — was never observed
 * and stayed invisible for good. Each `<Reveal>` now registers itself on
 * mount, so content that appears at any time is handled.
 *
 * One observer is shared rather than one per element: a list of several
 * hundred employees would otherwise create several hundred observers.
 */

let observer = null;

/** True when animating would be unwelcome or impossible. */
function revealImmediately() {
  if (typeof IntersectionObserver === "undefined") return true;
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sharedObserver() {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  return observer;
}

/**
 * Starts watching one element. Returns a cleanup function to call when it
 * unmounts.
 */
export function observeReveal(node) {
  if (!node) return () => {};

  if (revealImmediately()) {
    node.classList.add("is-visible");
    return () => {};
  }

  const io = sharedObserver();
  io.observe(node);
  return () => io.unobserve(node);
}
