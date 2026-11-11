import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Steps } from "@/components/ui/Steps";
import { PageHero } from "@/components/layout/PageHero";
import { SignInGate } from "@/components/layout/SignInGate";
import { useAuth } from "@/context/auth";
import { Card, Container, IconTile, Section, SectionHeading } from "@/components/ui/primitives";
import { benefitsIntro, deathDonations, otherActivities, welfareLoan } from "@/data/benefits";
import heroImage from "@/assets/events/womens-day-gift.jpg";

/**
 * What the Society pays out: the death donation amounts and the welfare loan.
 *
 * Schedule I of the Constitution repeats these same figures, so it is not
 * reproduced again here. What members pay in is on the Membership page.
 */
export function Benefits() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <PageHero
        breadcrumb="Benefits"
        image={heroImage}
        eyebrow="What membership gives you"
        eyebrowIcon="HandCoins"
        title="Benefits and facilities"
        lead={benefitsIntro}
        jumpLinks={[
          { to: "/benefits#death-donation", label: "Death donation", icon: "HeartHandshake" },
          /* The loan is not advertised to a visitor who is not signed in. */
          ...(isSignedIn
            ? [{ to: "/benefits#loan", label: "Welfare loan", icon: "HandCoins" }]
            : []),
          { to: "/benefits#other", label: "Other activities", icon: "PartyPopper" },
        ]}
      />

      <DeathDonations />
      <WelfareLoan />
      <OtherActivities />
    </>
  );
}

/* ------------------------------------------------------ Death donations --- */

function DeathDonations() {
  return (
    <Section id="death-donation">
      <Container>
        <SectionHeading
          eyebrow="In bereavement"
          eyebrowIcon="HeartHandshake"
          title="Death donation benefits"
        />

        <BenefitSchedule rows={deathDonations.rows} />

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

/**
 * The benefit schedule as a row of cards: category at the top, the amount
 * carrying the bottom of the card.
 *
 * Exactly one card is gold - the member's own cover, which is what most
 * people come to this page to find. That is emphasis, and it only works
 * because the others stay quiet: five coloured cards would say nothing at
 * all. Every figure stays in ink and is tabular so the columns line up.
 */
function BenefitSchedule({ rows }) {
  return (
    <div className="relative mt-12">
      {/* Soft gold wash behind the row, echoing the featured card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-40 bg-gradient-to-r from-transparent via-gold-200/45 to-transparent blur-3xl"
      />

      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {rows.map((row, i) => (
          <Reveal as="li" key={row.category} delay={i * 70}>
            <div
              className={cn(
                "hover-lift flex h-full min-h-54 flex-col rounded-2xl border p-5 shadow-soft",
                row.featured
                  ? "border-gold-400 bg-gold-400"
                  : "border-border bg-card hover:border-brand-300",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3
                  className={cn(
                    "m-0 font-display text-[12px] leading-relaxed font-bold tracking-[0.12em] uppercase",
                    row.featured ? "text-brand-950" : "text-ink",
                  )}
                >
                  {row.category}
                </h3>
                <Icon
                  name={row.icon}
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5 shrink-0",
                    row.featured ? "text-brand-950/70" : "text-brand-500",
                  )}
                />
              </div>

              {row.note ? (
                <p
                  className={cn(
                    "mt-2 text-[12px] leading-snug",
                    row.featured ? "text-brand-950/70" : "text-muted-foreground",
                  )}
                >
                  {row.note}
                </p>
              ) : null}

              <p
                className={cn(
                  "mt-auto pt-8 font-display text-[1.65rem] leading-none font-extrabold tracking-tight tabular-nums",
                  row.featured ? "text-brand-950" : "text-ink",
                )}
              >
                Rs. {row.amount.toLocaleString("en-US")}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------- Welfare loan --- */

function WelfareLoan() {
  const { isSignedIn } = useAuth();

  /* Nothing about the loan reaches a visitor who is not signed in - not the
   * amount, the terms, or that it exists beyond the invitation to sign in. */
  if (!isSignedIn) {
    return (
      <Section muted id="loan">
        <Container className="max-w-2xl">
          <SignInGate
            title="Members only"
            text="The Society's lending facility is for members. Sign in with your HRIS number to see the terms and apply."
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section muted id="loan">
      <Container>
        <SectionHeading
          eyebrow="Borrowing from the Society"
          eyebrowIcon="HandCoins"
          title={welfareLoan.name}
        />

        {/* The amount leads; the conditions support it. A row of six equal
         * lines made the one figure people come for no louder than the rest. */}
        <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="relative isolate flex h-full flex-col justify-center overflow-hidden rounded-2xl bg-brand-900 p-7 sm:p-9">
              <div className="bg-dots-gold absolute inset-0 opacity-25" aria-hidden="true" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full border border-gold-400/20"
              />

              <div className="relative">
                <p className="m-0 font-display text-[12px] font-bold tracking-[0.14em] text-gold-300 uppercase">
                  {welfareLoan.headline.label}
                </p>
                <p className="mt-3 m-0 font-display text-4xl leading-none font-extrabold tracking-tight text-white tabular-nums sm:text-5xl">
                  {welfareLoan.headline.value}
                </p>
                <p className="mt-4 m-0 max-w-xs text-[14px] leading-relaxed text-white/65">
                  {welfareLoan.headline.note}
                </p>
              </div>
            </div>
          </Reveal>

          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-2">
            {welfareLoan.terms.map((t, i) => (
              <Reveal
                as="li"
                key={t.label}
                delay={i * 60}
                className={i === welfareLoan.terms.length - 1 ? "sm:col-span-2" : undefined}
              >
                <div className="flex h-full items-start gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <Icon name={t.icon} className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  <div className="min-w-0">
                    <p className="m-0 font-display text-[11.5px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                      {t.label}
                    </p>
                    <p className="mt-1.5 m-0 font-display text-lg leading-none font-bold text-ink">
                      {t.value}
                    </p>
                    <p className="mt-1.5 m-0 text-[12.5px] leading-snug text-muted-foreground">
                      {t.note}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
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
          eyebrow="Beyond the benefits"
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
