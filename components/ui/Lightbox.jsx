import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Media } from "@/components/ui/PlaceholderTile";

/**
 * Full-screen gallery viewer.
 *
 * Closes on Escape or a backdrop click, steps with the arrow keys, and locks
 * body scroll while open.
 */
export function Lightbox({ items, index, onClose, onNavigate }) {
  const open = index !== null && index >= 0;
  const item = open ? items[index] : null;

  const step = useCallback(
    (dir) => {
      if (!open) return;
      onNavigate((index + dir + items.length) % items.length);
    },
    [open, index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, step]);

  if (!open || !item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-100 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute top-4 right-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:top-6 sm:right-6"
      >
        <Icon name="X" className="h-5 w-5" />
      </button>

      <NavArrow side="left" onClick={() => step(-1)} />
      <NavArrow side="right" onClick={() => step(1)} />

      <figure className="m-0 w-full max-w-4xl">
        <div className="aspect-16/10 w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
          <Media
            src={item.src}
            alt={item.title}
            icon={item.icon}
            tone={item.tone}
            label={item.category}
          />
        </div>

        <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span className="font-display text-base font-semibold text-white">{item.title}</span>
          <span className="text-sm text-white/65">
            {item.category} · {item.year}
          </span>
          <span className="w-full text-xs text-white/45">
            {index + 1} of {items.length} · use the arrow keys to browse
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

function NavArrow({ side, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center",
        "rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:inline-flex",
        side === "left" ? "left-4 lg:left-8" : "right-4 lg:right-8",
      )}
    >
      <Icon name={side === "left" ? "ChevronLeft" : "ChevronRight"} className="h-6 w-6" />
    </button>
  );
}
