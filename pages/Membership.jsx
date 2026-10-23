import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import {
  Button,
  Card,
  Container,
  IconTile,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { contributions, membership, society } from "@/data/society";

/**
 * Clause 3 — Membership and eligibility, with the contribution rules from
 * clause 7 that determine whether a member is entitled to benefits.
 *
 * There is no sign-up form here on purpose: the Constitution says membership
 * commences "in accordance with the approved membership procedure of the
 * Society", and that procedure is not part of this document.
 */
export function Membership() {
  return (
    <>
      <PageHero
        breadcrumb="Membership"
        eyebrow="Clause 3"
        eyebrowIcon="IdCard"
        title="Membership and eligibility"
        lead={`Who may join the ${society.name}, when membership begins, and when it ends.`}
        jumpLinks={[
          { to: "/membership#eligibility", label: "Eligibility", icon: "UserPlus" },
          { to: "/membership#entitlement", label: "Entitlement", icon: "CircleAlert" },
          { to: "/membership#cessation", label: "Cessation", icon: "UserMinus" },
        ]}
      />

      <Eligibility />
      <Entitlement />
      <Cessation />
      <Contributions />
    </>
  );
}

/* ---------------------------------------------------------- Eligibility --- */

function Eligibility() {
  return (
    <Section id="eligibility">
      <Container>
        <SectionHeading eyebrow="Becoming a member" eyebrowIcon="UserPlus" title="Eligibility" />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {membership.eligibility.map((text, i) => (
            <Reveal key={text} delay={i * 70}>
              <div className="hover-lift flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="font-display text-4xl font-extrabold text-brand-100 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------- Entitlement --- */

function Entitlement() {
  return (
    <Section muted id="entitlement">
      <Container>
        <SectionHeading
          eyebrow="Contribution and entitlement"
          eyebrowIcon="CircleAlert"
          title="Benefits depend on contributing"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {membership.conditions.map((text) => (
            <Reveal key={text}>
              <div className="h-full rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <IconTile name="CircleAlert" tone="amber" />
                  <p className="m-0 text-[15px] leading-relaxed text-foreground/80">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={90}>
            <Card className="h-full" hover={false}>
              <IconTile name="HandCoins" size="lg" />
              <h3 className="mt-4 font-display text-base font-semibold">
                What contributing entitles you to
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The death donation benefits and the welfare / emergency / distress loan, on the
                terms set out in clause 8 and Schedule I.
              </p>
              <Button
                to="/benefits"
                variant="outline"
                size="sm"
                iconRight="ArrowRight"
                className="mt-5"
              >
                Benefits and facilities
              </Button>
            </Card>
          </Reveal>
        </div>
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

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {membership.cessation.map((text, i) => (
            <Reveal key={text} delay={i * 80}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
                <IconTile name={i === 0 ? "LogOut" : "Heart"} tone={i === 0 ? "slate" : "rose"} />
                <p className="m-0 text-[15px] leading-relaxed text-foreground/80">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------- Contributions --- */

function Contributions() {
  return (
    <Section muted id="contributions">
      <Container>
        <SectionHeading
          eyebrow="Clause 7"
          eyebrowIcon="Wallet"
          title="Contributions to the Welfare Fund"
        />

        <ul className="m-0 mt-10 grid list-none gap-3 p-0 sm:grid-cols-2">
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
