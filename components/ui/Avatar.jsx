import { cn, initials } from "@/lib/utils";

/**
 * Member avatar. Shows a photo when `src` is given, otherwise the person's
 * initials on a soft orange gradient — so board cards look complete before
 * real photographs are supplied.
 */
export function Avatar({ name, src, size = "md", className }) {
  const dims = {
    sm: "h-10 w-10 text-[13px]",
    md: "h-14 w-14 text-base",
    lg: "h-20 w-20 text-xl",
    xl: "h-28 w-28 text-3xl",
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={cn(
          "shrink-0 rounded-full border-2 border-white object-cover shadow-soft",
          dims,
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "border-2 border-white bg-gradient-to-br from-brand-200 via-brand-100 to-brand-300",
        "font-display font-bold text-brand-800 shadow-soft",
        dims,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
