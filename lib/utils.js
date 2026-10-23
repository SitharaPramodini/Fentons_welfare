import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind classes winning. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** "2026-11-08" -> "08 Nov 2026" */
export function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** "2026-11-08" -> "November 2026" */
export function formatMonthYear(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Whole days from today until `iso`. Negative once the date has passed. */
export function daysUntil(iso) {
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

/** True when `iso` is today or later. */
export function isUpcoming(iso) {
  return daysUntil(iso) >= 0;
}

/** Earliest date first. */
export function sortByDateAsc(a, b) {
  return new Date(a.date) - new Date(b.date);
}

/** Most recent date first. */
export function sortByDateDesc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

/** "Nimal Perera" -> "NP" — used for photo-less avatars. */
export function initials(name = "") {
  const words = name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    // Drop honorifics, or every name here would read "M" for Mr/Mrs/Ms.
    .filter((w) => !/^(mr|mrs|ms|miss|dr|prof|rev|eng)\.?$/i.test(w))
    .filter(Boolean);

  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}
