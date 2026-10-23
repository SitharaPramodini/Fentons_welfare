import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import {
  Card,
  Container,
  IconTile,
  Section,
  SectionHeading,
  accent,
} from "@/components/ui/primitives";
import { amendment, generalProvisions, objectives, society } from "@/data/society";
import {
  committee,
  committeeFunctions,
  conduct,
  financialManagement,
  meetings,
  officeBearers,
  vacancies,
} from "@/data/governance";

/**
 * The Constitution, laid out clause by clause. This page is the reference
 * document — nothing is summarised away and nothing is added to it.
 */
export function About() {
  return (
    <>
      <PageHero
        breadcrumb="The Society"
        eyebrow={`${society.constitution.title} · Version ${society.constitution.version}`}
        eyebrowIcon="ScrollText"
        title={society.name}
        lead={society.governedBy}
        jumpLinks={[
          { to: "/about#objectives", label: "Objectives", icon: "Target" },
          { to: "/about#committee", label: "Committee", icon: "Landmark" },
          { to: "/about#meetings", label: "Meetings", icon: "CalendarCheck" },
          { to: "/about#office-bearers", label: "Office bearers", icon: "Users" },
          { to: "/about#finance", label: "Finance", icon: "Wallet" },
        ]}
      />

      <Objectives />
      <Committee />
      <Functions />
      <Meetings />
      <OfficeBearers />
      <Finance />
      <ConductAndVacancies />
      <AmendmentAndGeneral />
      <DocumentControl />
    </>
  );
}

/* ----------------------------------------------------------- shared bits --- */

/** A clause rendered as a list of provisions, each with a tick. */
function ClauseList({ items, className, tone = "brand" }) {
  const a = accent(tone);
  return (
    <ul className={cn("m-0 grid list-none gap-3 p-0", className)}>
      {items.map((text, i) => (
        <Reveal as="li" key={i} delay={i * 40} className="flex items-start gap-3">
          <Icon name="CircleCheck" className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", a.text)} />
          <span className="text-[15px] leading-relaxed text-foreground/80">{text}</span>
        </Reveal>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------- Objectives --- */

function Objectives() {
  return (
    <Section id="objectives">
      <Container>
        <SectionHeading eyebrow="Clause 2" eyebrowIcon="Target" title="Objectives" />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {objectives.map((o, i) => (
            <Reveal key={o.title} delay={i * 60}>
              <Card className="h-full">
                <IconTile name={o.icon} tone={o.accent} />
                <h3 className="mt-4 font-display text-base font-semibold">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ Committee --- */

function Committee() {
  return (
    <Section muted id="committee">
      <Container>
        <SectionHeading
          eyebrow="Clause 4"
          eyebrowIcon="Landmark"
          title="Committee of Management"
          lead={committee.remit}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <h3 className="m-0 font-display text-lg font-semibold">
                4.1 Composition and appointment
              </h3>
              <ClauseList items={committee.composition} className="mt-5" />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <h3 className="m-0 font-display text-lg font-semibold">4.2 Term of office</h3>
              <ClauseList items={committee.term} className="mt-5" tone="amber" />

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
                <Icon name="CalendarClock" className="h-5 w-5 shrink-0 text-brand-600" />
                <p className="m-0 text-sm font-medium text-ink">
                  Two (2) years from the date of the first meeting
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ Functions --- */

function Functions() {
  return (
    <Section id="functions">
      <Container>
        <SectionHeading
          eyebrow="Clause 5"
          eyebrowIcon="ClipboardCheck"
          title="Functions and responsibilities"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {committeeFunctions.map((f, i) => (
            <Reveal key={f.text} delay={i * 50}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <IconTile name={f.icon} size="sm" />
                <p className="m-0 text-sm leading-relaxed text-foreground/80">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------- Meetings --- */

function Meetings() {
  return (
    <Section muted id="meetings">
      <Container>
        <SectionHeading eyebrow="Clause 6" eyebrowIcon="CalendarCheck" title="Meetings" />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {meetings.facts.map((f, i) => (
            <Reveal key={f.label} delay={i * 70}>
              <Card className="h-full text-center" hover={false}>
                <IconTile name={f.icon} size="lg" className="mx-auto" />
                <p className="mt-4 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  {f.label}
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink">{f.value}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <h3 className="m-0 font-display text-lg font-semibold">Conduct of meetings</h3>
              <ClauseList items={meetings.rules} className="mt-5" />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <h3 className="m-0 font-display text-lg font-semibold">6.1 Minutes of meetings</h3>
              <ClauseList items={meetings.minutes} className="mt-5" tone="sky" />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------- Office bearers --- */

function OfficeBearers() {
  return (
    <Section id="office-bearers">
      <Container>
        <SectionHeading
          eyebrow="Clause 10"
          eyebrowIcon="Users"
          title="Duties of office bearers"
          lead="The Constitution defines the offices and their duties. Office bearers are appointed by Senior Management, so no names are recorded here."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {officeBearers.map((person, i) => {
            const a = accent(person.accent);
            return (
              <Reveal key={person.role} delay={i * 80}>
                <article className="hover-lift flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <div className={cn("flex items-center gap-3 px-6 py-5", a.bg)}>
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white/80",
                        a.border,
                        a.text,
                      )}
                    >
                      <Icon name={person.icon} className="h-5 w-5" />
                    </span>
                    <h3
                      className={cn("m-0 font-display text-[15px] leading-snug font-bold", a.text)}
                    >
                      {person.role}
                    </h3>
                  </div>

                  <ul className="m-0 flex flex-1 list-none flex-col gap-3 p-6">
                    {person.duties.map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <Icon
                          name="CircleCheck"
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
                        />
                        <span className="text-sm leading-relaxed text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------- Finance --- */

function Finance() {
  return (
    <Section muted id="finance">
      <Container>
        <SectionHeading
          eyebrow="Clause 9"
          eyebrowIcon="Wallet"
          title="Financial management and accounts"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Card className="h-full text-center" hover={false}>
              <IconTile name="CalendarDays" size="lg" className="mx-auto" />
              <p className="mt-4 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Financial year
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-ink">
                {financialManagement.financialYear}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Unless otherwise determined by the Company.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={90}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <ClauseList items={financialManagement.rules} tone="emerald" />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------- Conduct, discipline, gaps --- */

function ConductAndVacancies() {
  return (
    <Section id="conduct">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <SectionHeading
                eyebrow="Clause 11"
                eyebrowIcon="Scale"
                title="Conduct and discipline"
                className="max-w-none"
              />
              <ClauseList items={conduct} className="mt-6" tone="rose" />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <SectionHeading
                eyebrow="Clause 12"
                eyebrowIcon="UserPlus"
                title="Vacancies and replacement"
                className="max-w-none"
              />
              <ClauseList items={vacancies} className="mt-6" tone="violet" />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------- Amendment and provisions --- */

function AmendmentAndGeneral() {
  return (
    <Section muted id="amendment">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <SectionHeading
                eyebrow="Clause 13"
                eyebrowIcon="PenLine"
                title="Amendment of the Constitution"
                className="max-w-none"
              />
              <ClauseList items={amendment} className="mt-6" tone="amber" />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <SectionHeading
                eyebrow="Clause 14"
                eyebrowIcon="ScrollText"
                title="General provisions"
                className="max-w-none"
              />
              <ClauseList items={generalProvisions} className="mt-6" tone="slate" />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------- Schedule II block --- */

function DocumentControl() {
  return (
    <Section id="document-control">
      <Container>
        <Reveal>
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <IconTile name="FileText" tone="slate" />
              <div>
                <h2 className="m-0 font-display text-lg font-semibold">Schedule II — Approval</h2>
                <p className="m-0 mt-1 text-sm text-muted-foreground">
                  {society.constitution.title}, Version {society.constitution.version}
                </p>
              </div>
            </div>

            <dl className="m-0 mt-6 grid gap-3 sm:grid-cols-2">
              {society.constitution.approvalPending.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <dt className="text-sm font-medium text-ink">{field}</dt>
                  <dd className="m-0 text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Not yet recorded
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              The approval block of the Constitution has not been completed, so no signatory or
              effective date is shown here. It will be filled in once Senior Management has signed
              the document.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
