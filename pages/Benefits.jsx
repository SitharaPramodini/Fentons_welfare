import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Steps } from "@/components/ui/Steps";
import { PageHero } from "@/components/layout/PageHero";
import {
  Card,
  Container,
  IconTile,
  Section,
  SectionHeading,
  accent,
} from "@/components/ui/primitives";
import {
  benefitsIntro,
  deathDonations,
  otherActivities,
  scheduleI,
  welfareLoan,
} from "@/data/benefits";
import { contributions } from "@/data/society";

/**
 * Clause 8 and Schedule I — the benefit amounts, the loan conditions, and the
 * contribution rules that sit behind them.
 */
export function Benefits() {
  return (
    <>
      <PageHero
        breadcrumb="Benefits"
        eyebrow="Clause 8"
        eyebrowIcon="HandCoins"
        title="Benefits and facilities"
        lead={benefitsIntro}
        jumpLinks={[
          { to: "/benefits#death-donation", label: "Death donation", icon: "HeartHandshake" },
          { to: "/benefits#loan", label: "Welfare loan", icon: "HandCoins" },
          { to: "/benefits#contributions", label: "Contributions", icon: "Wallet" },
          { to: "/benefits#schedule", label: "Schedule I", icon: "FileText" },
        ]}
      />

      <DeathDonations />
      <WelfareLoan />
      <OtherActivities />
      <Contributions />
      <ScheduleOne />
    </>
  );
}

/* ------------------------------------------------------ Death donations --- */

function DeathDonations() {
  return (
    <Section id="death-donation">
      <Container>
        <SectionHeading
          eyebrow="Clause 8.1"
          eyebrowIcon="HeartHandshake"
          title="Death donation benefits"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deathDonations.rows.map((row, i) => {
            const a = accent(row.accent);
            return (
              <Reveal key={row.category} delay={i * 60}>
                <div
                  className={cn(
                    "hover-lift flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-soft",
                    a.border,
                  )}
                >
                  <div className={cn("h-1 w-full bg-gradient-to-r", a.grad)} />

                  <div className="flex flex-1 flex-col p-6">
                    <IconTile name={row.icon} tone={row.accent} />

                    <h3 className="mt-4 font-display text-base leading-snug font-semibold">
                      {row.category}
                    </h3>
                    {row.note ? (
                      <p className="mt-1 text-[12.5px] text-muted-foreground">{row.note}</p>
                    ) : null}

                    <p
                      className={cn(
                        "mt-auto pt-5 font-display text-3xl font-extrabold tracking-tight",
                        a.text,
                      )}
                    >
                      Rs. {row.amount.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <Icon name="Info" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="m-0 text-sm leading-relaxed text-muted-foreground">
              {deathDonations.condition}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------- Welfare loan --- */

function WelfareLoan() {
  return (
    <Section muted id="loan">
      <Container>
        <SectionHeading eyebrow="Clause 8.2" eyebrowIcon="HandCoins" title={welfareLoan.name} />

        {/* Headline terms */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 to-brand-600" />
          <dl className="m-0 divide-y divide-border">
            {welfareLoan.terms.map((t) => (
              <div
                key={t.label}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-4 sm:px-7"
              >
                <dt className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                  <Icon name={t.icon} className="h-4 w-4 shrink-0 text-brand-500" />
                  {t.label}
                </dt>
                <dd
                  className={cn(
                    "m-0 font-display text-ink",
                    t.strong
                      ? "text-xl font-extrabold text-brand-700"
                      : "text-[15px] font-semibold",
                  )}
                >
                  {t.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Eligibility */}
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <div className="flex items-center gap-3">
                <IconTile name="ClipboardCheck" />
                <h3 className="m-0 font-display text-lg font-semibold">Eligibility and limits</h3>
              </div>

              <ul className="m-0 mt-5 grid list-none gap-3 p-0">
                {welfareLoan.eligibility.map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <Icon
                      name="CircleCheck"
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-500"
                    />
                    <span className="text-[15px] leading-relaxed text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Process */}
          <Reveal delay={90}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-7">
              <div className="flex items-center gap-3">
                <IconTile name="Send" tone="sky" />
                <h3 className="m-0 font-display text-lg font-semibold">How a loan is granted</h3>
              </div>

              <Steps steps={welfareLoan.process} className="mt-6" />
            </div>
          </Reveal>
        </div>

        {/* Recovery */}
        <Reveal delay={150}>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <IconTile name="CircleAlert" tone="amber" />
              <h3 className="m-0 font-display text-lg font-semibold">
                Recovery of an unsettled loan
              </h3>
            </div>

            <ul className="m-0 mt-5 grid list-none gap-3 p-0">
              {welfareLoan.recovery.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon name="ArrowRight" className="mt-1 h-4 w-4 shrink-0 text-amber-700" />
                  <span className="text-[15px] leading-relaxed text-foreground/80">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------ Other activities --- */

function OtherActivities() {
  return (
    <Section id="other">
      <Container>
        <SectionHeading
          eyebrow="Clause 8.3"
          eyebrowIcon="PartyPopper"
          title="Other existing welfare activities and facilities"
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Reveal>
            <Card className="h-full" hover={false}>
              <IconTile name="RefreshCw" tone="emerald" size="lg" />
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
                {otherActivities.text}
              </p>
            </Card>
          </Reveal>

          <Reveal delay={90}>
            <Card className="h-full" hover={false}>
              <IconTile name="ShieldCheck" tone="slate" size="lg" />
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
                {otherActivities.change}
              </p>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------- Contributions --- */

function Contributions() {
  return (
    <Section muted id="contributions">
      <Container>
        <SectionHeading
          eyebrow="Clause 7"
          eyebrowIcon="Wallet"
          title="Contributions to the Welfare Fund"
          lead="The benefits above are paid out of the Welfare Fund, which members build through the approved contribution arrangement."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {contributions.map((c, i) => (
            <Reveal key={c.text} delay={i * 60}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <IconTile name={c.icon} size="sm" />
                <p className="m-0 text-sm leading-relaxed text-foreground/80">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ Schedule I --- */

function ScheduleOne() {
  return (
    <Section id="schedule">
      <Container>
        <SectionHeading
          eyebrow="Schedule I"
          eyebrowIcon="FileText"
          title="Existing approved welfare benefits"
          lead="The benefits to be retained under the reformed Constitution."
        />

        <Reveal className="mt-10">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-5 py-4 font-display text-[12px] font-bold tracking-[0.08em] text-muted-foreground uppercase sm:px-6">
                    Benefit
                  </th>
                  <th className="px-5 py-4 font-display text-[12px] font-bold tracking-[0.08em] text-muted-foreground uppercase sm:px-6">
                    Current benefit
                  </th>
                  <th className="px-5 py-4 font-display text-[12px] font-bold tracking-[0.08em] text-muted-foreground uppercase sm:px-6">
                    Condition / remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scheduleI.map((row) => (
                  <tr key={row.benefit} className="transition-colors hover:bg-brand-50/40">
                    <td className="px-5 py-4 text-sm font-medium text-ink sm:px-6">
                      {row.benefit}
                    </td>
                    <td className="px-5 py-4 font-display text-sm font-bold text-brand-700 sm:px-6">
                      {row.current}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground sm:px-6">
                      {row.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
