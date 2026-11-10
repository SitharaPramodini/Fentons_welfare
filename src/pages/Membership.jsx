import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { MembershipForm } from "@/components/forms/MembershipForm";
import { SignInGate } from "@/components/layout/SignInGate";
import {
  Button,
  Card,
  Container,
  IconTile,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { contributions, membership, society } from "@/data/society";
import heroImage from "@/assets/events/cricket-team-selfie.jpg";

/**
 * Who may join, what it costs, what a member may expect and owe, when
 * membership ends - and the form itself.
 *
 * Everything on this page comes from clauses 4, 5 and 10 of the Reformed
 * Constitution (Draft V1, 21.10.2026).
 */
export function Membership() {
  return (
    <>
      <PageHero
        breadcrumb="Membership"
        image={heroImage}
        eyebrow="Joining the Society"
        eyebrowIcon="IdCard"
        title="Membership"
        lead={`Who may join the ${society.name}, what it costs, and how to apply.`}
        jumpLinks={[
          { to: "/membership#apply", label: "Apply to join", icon: "PenLine" },
          { to: "/membership#eligibility", label: "Who can join", icon: "UserPlus" },
          { to: "/membership#rights", label: "Rights and duties", icon: "Scale" },
        ]}
      />

      <Eligibility />
      <Rights />
      <Cessation />
      <Apply />
    </>
  );
}

/* ---------------------------------------------------------- Eligibility --- */

function Eligibility() {
  const { entrance, monthly, note } = membership.fees;

  return (
    <Section id="eligibility">
      <Container>
        <SectionHeading
          eyebrow="Who can join"
          eyebrowIcon="UserPlus"
          title="Eligibility and cost"
          lead={`Membership is open to employees of ${society.parentCompany} on every category of contract.`}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Who is eligible */}
          <Reveal>
            <Card className="h-full" hover={false}>
              <IconTile name="Users" size="lg" />
              <h3 className="mt-4 font-display text-base font-semibold">Open to</h3>

              <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                {membership.openTo.map((type) => (
                  <li
                    key={type}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 font-display text-[13px] font-semibold text-brand-800"
                  >
                    <Icon name="CircleCheck" className="h-3.5 w-3.5" />
                    {type}
                  </li>
                ))}
              </ul>

              <ul className="m-0 mt-5 grid list-none gap-2.5 border-t border-border p-0 pt-5">
                {membership.eligibility.map((text) => (
                  <li key={text} className="flex items-start gap-2.5">
                    <Icon name="CircleCheck" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span className="text-[14.5px] leading-relaxed text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          {/* What it costs */}
          <Reveal delay={90}>
            <Card className="h-full" hover={false}>
              <IconTile name="Wallet" size="lg" tone="gold" />
              <h3 className="mt-4 font-display text-base font-semibold">What it costs</h3>

              <div className="mt-5 grid gap-3">
                <Fee label="Entrance fee" amount={entrance} suffix="once" />
                <Fee label="Monthly subscription" amount={monthly} suffix="per month" />
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{note}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Both are deducted from your salary once you join.
              </p>
            </Card>
          </Reveal>
        </div>

        {/* The four rules that apply to the money */}
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
          {contributions.map((c, i) => (
            <Reveal as="li" key={c.text} delay={i * 60}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <Icon name={c.icon} className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <p className="m-0 text-sm leading-relaxed text-foreground/80">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Fee({ label, amount, suffix }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3.5">
      <span className="font-display text-[13.5px] font-semibold text-ink">{label}</span>
      <span className="text-right">
        <span className="font-display text-xl font-bold text-ink tabular-nums">
          Rs. {amount.toLocaleString("en-LK")}
        </span>
        <span className="ml-1.5 text-[12px] text-muted-foreground">{suffix}</span>
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- Rights --- */

function Rights() {
  return (
    <Section muted id="rights">
      <Container>
        <SectionHeading
          eyebrow="Being a member"
          eyebrowIcon="Scale"
          title="What you can expect, and what is expected of you"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full" hover={false}>
              <IconTile name="CircleCheck" tone="emerald" size="lg" />
              <h3 className="mt-4 font-display text-base font-semibold">Every member may</h3>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                {membership.rights.map((text) => (
                  <li key={text} className="flex items-start gap-2.5">
                    <Icon name="CircleCheck" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-[14.5px] leading-relaxed text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={90}>
            <Card className="h-full" hover={false}>
              <IconTile name="Handshake" tone="sky" size="lg" />
              <h3 className="mt-4 font-display text-base font-semibold">Every member shall</h3>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
                {membership.obligations.map((text) => (
                  <li key={text} className="flex items-start gap-2.5">
                    <Icon name="CircleCheck" className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span className="text-[14.5px] leading-relaxed text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <IconTile name="CircleAlert" tone="amber" />
              <div className="min-w-0">
                <h3 className="m-0 font-display text-base font-semibold">
                  Benefits depend on contributing
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
                  A member whose subscriptions are not up to date is not entitled to the benefits
                  and facilities of the Society for that period, subject to any approved exception.
                </p>
                <Button
                  to="/benefits"
                  variant="outline"
                  size="sm"
                  iconRight="ArrowRight"
                  className="mt-5"
                >
                  What membership covers
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ Cessation --- */

function Cessation() {
  return (
    <Section id="cessation">
      <Container>
        <SectionHeading
          eyebrow="Ending membership"
          eyebrowIcon="UserMinus"
          title="When membership ceases"
        />

        {/* Columns rather than a card grid, and deliberately no arrows
         * between them: these are five alternatives, not five steps. Any one
         * of them ends membership on its own, so a connector would imply an
         * order that does not exist. */}
        <ul className="m-0 mt-12 grid list-none gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {membership.cessation.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={i * 70}
              className="xl:border-l xl:border-border xl:pl-6 xl:first:border-l-0 xl:first:pl-0"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                <Icon name={item.icon} className="h-6 w-6" />
              </span>

              <h3 className="mt-5 font-display text-lg leading-snug font-bold text-ink">
                {item.title}
              </h3>

              <p className="mt-3 m-0 text-[14.5px] leading-relaxed text-foreground/75">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm leading-relaxed text-muted-foreground">
            {membership.formerEmployees}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------------- Apply --- */

function Apply() {
  return (
    <Section muted id="apply">
      <Container>
        <SectionHeading
          eyebrow="Apply"
          eyebrowIcon="PenLine"
          title="Apply for membership"
          lead="Your details go to the Society's office and the HR Division, who confirm your membership."
        />

        <div className="mt-10">
          <SignInGate
            title="Sign in to apply"
            text="Applying takes a moment once you are signed in - most of the form fills itself in from your staff record. Sign in with your HRIS number."
          >
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-9 lg:p-10">
              <MembershipForm />
            </div>
          </SignInGate>
        </div>
      </Container>
    </Section>
  );
}
