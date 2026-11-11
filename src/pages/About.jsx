import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Avatar } from "@/components/ui/Avatar";
import { PageHero } from "@/components/layout/PageHero";
import { Card, Container, IconTile, Section, SectionHeading } from "@/components/ui/primitives";
import { objectives, society } from "@/data/society";
import { committee, committeeFunctions, meetings, officeBearers } from "@/data/governance";
import { corporateManagement } from "@/data/management";
import heroImage from "@/assets/events/iftar-group-photo.jpg";

/**
 * What the Society is for and who runs it.
 *
 * Deliberately short. The Constitution's internal procedure - meeting
 * conduct, minutes, financial controls, discipline, vacancies, amendment -
 * is not reproduced here; members who need it should ask the Secretary for
 * the document itself.
 */
export function About() {
  return (
    <>
      <PageHero
        breadcrumb="The Society"
        image={heroImage}
        eyebrow="About us"
        eyebrowIcon="ScrollText"
        title={society.name}
        lead={society.intro}
        jumpLinks={[
          { to: "/about#objectives", label: "What we do", icon: "Target" },
          { to: "/about#committee", label: "Who runs it", icon: "Landmark" },
          { to: "/about#management", label: "Corporate management", icon: "Users" },
        ]}
      />

      <Objectives />
      <Committee />
      <CorporateManagement />
    </>
  );
}

/* ------------------------------------------------------------ Objectives --- */

function Objectives() {
  return (
    <Section id="objectives">
      <Container>
        <SectionHeading
          eyebrow="What the Society is for"
          eyebrowIcon="Target"
          title="Objectives"
          lead={`The Society exists for the employees of ${society.parentCompany}.`}
        />

        {/* The first objective is the Society's whole purpose, so it leads at
         * double width on the dark ground; the other four support it. That
         * also fills the grid, which five equal cards never do. A colour per
         * card encoded nothing, so they now share one. */}
        <ul className="m-0 mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {objectives.map((objective, i) => {
            const lead = i === 0;
            return (
              <Reveal
                as="li"
                key={objective.title}
                delay={i * 70}
                className={lead ? "lg:col-span-2" : undefined}
              >
                <div
                  className={cn(
                    "hover-lift relative isolate flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-soft sm:p-7",
                    lead ? "bg-brand-900" : "border border-border bg-card",
                  )}
                >
                  {lead ? (
                    <div className="bg-dots-gold absolute inset-0 opacity-25" aria-hidden="true" />
                  ) : null}

                  <div className="relative flex h-full flex-col">
                    <span
                      className={cn(
                        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                        lead
                          ? "border-gold-400/30 bg-gold-400/15 text-gold-300"
                          : "border-brand-100 bg-brand-50 text-brand-700",
                      )}
                    >
                      <Icon name={objective.icon} className="h-6 w-6" />
                    </span>

                    <h3
                      className={cn(
                        "mt-5 font-display leading-snug font-semibold",
                        lead ? "text-xl text-white sm:text-2xl" : "text-base text-ink",
                      )}
                    >
                      {objective.title}
                    </h3>

                    <p
                      className={cn(
                        "mt-2.5 leading-relaxed",
                        lead
                          ? "max-w-md text-[15px] text-white/70"
                          : "text-sm text-muted-foreground",
                      )}
                    >
                      {objective.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------- Committee --- */

function Committee() {
  return (
    <Section muted id="committee">
      <Container>
        <SectionHeading
          eyebrow="Who runs it"
          eyebrowIcon="Landmark"
          title="The Committee of Management"
          lead={committee.remit}
        />

        {/* The three facts about the Committee itself */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {committee.facts.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 70}>
              <Card className="h-full" hover={false}>
                <IconTile name={fact.icon} />
                <p className="mt-4 m-0 font-display text-[11.5px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                  {fact.label}
                </p>
                <p className="mt-1 m-0 font-display text-[15px] font-semibold text-ink">
                  {fact.value}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* What it does for a member */}
        <Reveal>
          <div className="mt-8 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8 lg:grid-cols-2">
            <div>
              <h3 className="m-0 font-display text-base font-semibold">What the Committee does</h3>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                {committeeFunctions.map((fn) => (
                  <li key={fn.text} className="flex items-start gap-2.5">
                    <Icon name={fn.icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span className="text-[14.5px] leading-relaxed text-foreground/80">
                      {fn.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="m-0 font-display text-base font-semibold">When it meets</h3>
              <div className="mt-4 grid gap-2.5">
                {meetings.facts.map((fact) => (
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
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{meetings.note}</p>
            </div>
          </div>
        </Reveal>

        {/* Who to approach. A bearer who has been named shows their
         * photograph; one who has not shows the role on its own, which is
         * all the Constitution itself records. */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {officeBearers.map((bearer, i) => (
            <Reveal key={bearer.role} delay={i * 80}>
              <Card className="h-full">
                {bearer.name ? (
                  <Avatar name={bearer.name} src={bearer.photo} size="lg" />
                ) : (
                  <IconTile name={bearer.icon} tone={bearer.accent} />
                )}

                {bearer.name ? (
                  <>
                    <h3 className="mt-4 font-display text-base font-semibold text-ink">
                      {bearer.name}
                    </h3>
                    <p className="mt-1 m-0 font-display text-[13px] font-semibold text-brand-700">
                      {bearer.role}
                    </p>
                  </>
                ) : (
                  <h3 className="mt-4 font-display text-[15px] font-semibold">{bearer.role}</h3>
                )}

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {bearer.summary}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------- Corporate management --- */

/**
 * The Company's leadership. Kept separate from the Committee of Management
 * above, which is a different body: these are the officers of Hayleys Fentons
 * Limited, and Senior Management is drawn from them.
 *
 * Anyone whose photograph has not been supplied yet falls back to their
 * initials, so a missing file never leaves a hole in the grid.
 */
function CorporateManagement() {
  return (
    <Section id="management">
      <Container>
        <SectionHeading
          eyebrow="The Company"
          eyebrowIcon="Users"
          title="Corporate management"
          lead={`The leadership of ${society.parentCompany}. The Society’s Committee of Management is appointed by Senior Management from the Company.`}
        />

        <ul className="m-0 mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {corporateManagement.map((person, i) => (
            <Reveal as="li" key={person.name} delay={Math.min(i, 8) * 50}>
              <Card className="h-full text-center">
                <Avatar name={person.name} src={person.photo} size="xl" className="mx-auto" />

                <h3 className="mt-4 font-display text-[15px] leading-snug font-semibold text-ink">
                  {person.name}
                </h3>

                <p className="mt-1.5 m-0 font-display text-[13px] font-semibold text-brand-700">
                  {person.role}
                </p>

                {person.unit ? (
                  <p className="mt-1 m-0 text-[12.5px] leading-snug text-muted-foreground">
                    {person.unit}
                  </p>
                ) : null}
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
