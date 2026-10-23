import { Link } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { meetings } from "@/data/governance";
import { society } from "@/data/society";

/**
 * Thin dark strip above the header.
 *
 * It carries the one standing fact every member may need — when the Committee
 * of Management sits — and the version of the document this site reports.
 * Nothing here is promotional, because nothing promotional is on record.
 */
export function TopBar() {
  const when = meetings.facts.find((f) => f.label === "When")?.value;
  const time = meetings.facts.find((f) => f.label === "Time")?.value;

  return (
    <div className="bg-brand-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-2.5 sm:px-6 lg:justify-between lg:px-8">
        <p className="m-0 flex items-center gap-2.5 text-[12.5px] text-white/75">
          <Icon name="CalendarCheck" className="h-4 w-4 shrink-0 text-gold-400" />
          <span>
            Committee of Management meets{" "}
            <span className="font-semibold text-white">{when?.toLowerCase()}</span> at{" "}
            <span className="font-semibold text-white">{time}</span>
          </span>
        </p>

        <Link
          to="/about#document-control"
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-3.5 py-1.5 font-display text-[12px] font-bold tracking-wide text-brand-950 transition hover:bg-gold-300"
        >
          <Icon name="ScrollText" className="h-3.5 w-3.5" />
          {society.constitution.title} v{society.constitution.version}
        </Link>
      </div>
    </div>
  );
}
