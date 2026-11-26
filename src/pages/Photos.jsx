import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Lightbox } from "@/components/ui/Lightbox";
import { Media } from "@/components/ui/PlaceholderTile";
import { PageHero } from "@/components/layout/PageHero";
import { Container, EmptyState, Section } from "@/components/ui/primitives";
import { gallery, galleryCategories, latestActivity } from "@/data/gallery";
import { otherActivities } from "@/data/benefits";
import heroImage from "@/assets/events/netball-championship.jpg";

const spans = {
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  normal: "col-span-1 row-span-1",
};

/**
 * The most recent occasion, given room above the grid so a member sees what
 * has just happened before they start browsing the rest. Driven entirely by
 * `latestActivity`; if that is null the strip is simply not rendered.
 */
function LatestActivity() {
  if (!latestActivity) return null;

  return (
    <Reveal>
      <div className="mb-10 grid overflow-hidden rounded-3xl border border-border bg-card shadow-card lg:grid-cols-2">
        <div className="relative aspect-16/10 lg:aspect-auto lg:h-full lg:min-h-88">
          <img
            src={latestActivity.image}
            alt={latestActivity.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <p className="m-0 flex items-center gap-2 font-display text-[11.5px] font-bold tracking-[0.12em] text-brand-700 uppercase">
            <Icon name="Sparkles" className="h-4 w-4 shrink-0" />
            {latestActivity.eyebrow}
          </p>

          <h2 className="mt-3 font-display text-2xl leading-tight font-semibold text-ink sm:text-3xl">
            {latestActivity.title}
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {latestActivity.lead}
          </p>

          <div className="mt-6 grid gap-2.5">
            {latestActivity.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <Icon name={fact.icon} className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="font-display text-[13px] font-semibold text-muted-foreground">
                  {fact.label}
                </span>
                <span className="ml-auto text-right font-display text-[14px] font-semibold text-ink">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * Photographs from the Society's welfare activities - clause 8.3.
 *
 * The Constitution does not set an events calendar, so there is none here:
 * this page shows what has actually taken place, nothing scheduled.
 */
export function Photos() {
  const [category, setCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);

  const items = useMemo(
    () => (category === "All" ? gallery : gallery.filter((g) => g.category === category)),
    [category],
  );

  const options = useMemo(
    () =>
      galleryCategories.map((c) => ({
        value: c,
        label: c,
        count: c === "All" ? gallery.length : gallery.filter((g) => g.category === c).length,
      })),
    [],
  );

  return (
    <>
      <PageHero
        breadcrumb="Photos"
        image={heroImage}
        eyebrow="Photo gallery"
        eyebrowIcon="Camera"
        title="Welfare activities"
        lead={otherActivities.text}
      />

      <Section>
        <Container>
          <LatestActivity />

          <FilterTabs
            options={options}
            value={category}
            onChange={(next) => {
              setCategory(next);
              setOpenIndex(null);
            }}
            label="Filter photographs by activity"
          />

          {items.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon="Camera"
                title="No photographs in this category"
                text="Choose another category to see the rest of the collection."
              />
            </div>
          ) : (
            <div
              className={cn(
                "mt-8 grid auto-rows-[9rem] grid-cols-2 gap-3",
                "sm:auto-rows-[11rem] sm:grid-cols-3 lg:auto-rows-[12rem] lg:grid-cols-4",
              )}
            >
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Open ${item.title}`}
                  className={cn(
                    "group relative block cursor-pointer overflow-hidden rounded-2xl",
                    "border border-border shadow-soft transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-card",
                    spans[item.span] ?? spans.normal,
                  )}
                >
                  <Media
                    src={item.src}
                    alt={item.title}
                    icon={item.icon}
                    tone={item.tone}
                    label={item.category}
                  />

                  <span className="absolute inset-0 flex items-end bg-linear-to-t from-ink/85 via-ink/15 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-left text-[12px] leading-snug font-semibold text-white">
                      {item.title}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </Container>

        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      </Section>

      {/* <Section muted>
        <Container>
          <Reveal>
            <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-muted-foreground">
              {otherActivities.change}
            </p>
          </Reveal>
        </Container>
      </Section> */}
    </>
  );
}
