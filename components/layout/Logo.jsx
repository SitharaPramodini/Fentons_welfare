import { cn } from "@/lib/utils";
import { society } from "@/data/society";
import logoFile from "@/assets/logo.png";

/**
 * Society logo.
 *
 * The artwork is the corporate Hayleys Fentons lockup — a wide mark that
 * already carries the "Fentons" wordmark, so this component does NOT repeat it
 * in text. Instead the lockup is followed by a rule and "Welfare Society", the
 * usual way a staff body signs itself under the company brand.
 *
 * The PNG is a white rounded panel on a transparent ground, so it sits
 * invisibly on the light header and reads as a white card on the dark footer.
 */

/** The logo artwork on its own, no wordmark. Use where space is tight. */
export function LogoMark({ className }) {
  return (
    <img
      src={logoFile}
      alt=""
      width="2560"
      height="1317"
      className={cn("h-11 w-auto shrink-0 object-contain", className)}
    />
  );
}

/** Lockup plus the society line. `compact` drops the society line. */
export function Logo({ className, compact = false, invert = false }) {
  return (
    <span className={cn("flex items-center gap-3", className)} aria-label={society.name} role="img">
      <LogoMark />

      {!compact ? (
        <>
          <span
            aria-hidden="true"
            className={cn("h-8 w-px shrink-0", invert ? "bg-white/25" : "bg-border")}
          />
          <span
            className={cn(
              "font-display text-[12px] leading-tight font-bold tracking-[0.14em] uppercase",
              invert ? "text-brand-200" : "text-brand-700",
            )}
          >
            Welfare
            <br />
            Society
          </span>
        </>
      ) : null}
    </span>
  );
}
