import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Scroll-snap carousel.
 *
 * Built on native overflow scrolling rather than a carousel library: touch and
 * trackpad swiping, keyboard scrolling and screen readers all work for free,
 * and it adds no dependency. The arrows and dots just drive scrollTo().
 *
 * `autoPlay` advances every `interval` ms, and pauses on hover, on focus
 * within, and while the tab is hidden.
 */
export function Carousel({
  children,
  className,
  itemClassName,
  autoPlay = false,
  interval = 5000,
  ariaLabel = "Carousel",
}) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const items = Array.isArray(children) ? children : [children];
  const count = items.length;

  /* Keep the active dot in sync with however the user scrolled. */
  const syncIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild;
    if (!slide) return;

    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const step = slide.getBoundingClientRect().width + gap;
    if (step <= 0) return;

    setIndex(Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / step))));
  }, [count]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncIndex);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [syncIndex]);

  const scrollToIndex = useCallback((next) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild;
    if (!slide) return;

    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const step = slide.getBoundingClientRect().width + gap;
    track.scrollTo({ left: next * step, behavior: "smooth" });
  }, []);

  const go = useCallback(
    (dir) => {
      const next = (index + dir + count) % count;
      setIndex(next);
      scrollToIndex(next);
    },
    [index, count, scrollToIndex],
  );

  /* Auto-advance */
  useEffect(() => {
    if (!autoPlay || paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      if (document.hidden) return;
      go(1);
    }, interval);

    return () => clearInterval(id);
  }, [autoPlay, paused, count, interval, go]);

  return (
    <div
      className={cn("relative", className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div ref={trackRef} className="snap-row flex gap-5 overflow-x-auto pb-2">
        {items.map((child, i) => (
          <div
            key={i}
            className={cn("snap-item shrink-0", itemClassName)}
            aria-hidden={count > 1 && i !== index ? undefined : undefined}
          >
            {child}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-4">
          <CarouselButton label="Previous" icon="ChevronLeft" onClick={() => go(-1)} />

          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1} of ${count}`}
                aria-current={i === index}
                onClick={() => {
                  setIndex(i);
                  scrollToIndex(i);
                }}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-brand-500" : "w-2 bg-brand-200 hover:bg-brand-300",
                )}
              />
            ))}
          </div>

          <CarouselButton label="Next" icon="ChevronRight" onClick={() => go(1)} />
        </div>
      ) : null}
    </div>
  );
}

function CarouselButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full",
        "border border-border bg-card text-brand-700 shadow-soft transition-all duration-300",
        "hover:border-brand-400 hover:bg-brand-50 hover:scale-105",
      )}
    >
      <Icon name={icon} className="h-4.5 w-4.5" />
    </button>
  );
}
