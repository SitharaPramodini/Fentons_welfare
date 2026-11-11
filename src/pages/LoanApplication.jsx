import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { LoanForm } from "@/components/forms/LoanForm";
import { Card, Container, IconTile, Section, SectionHeading } from "@/components/ui/primitives";
import { welfareLoan } from "@/data/benefits";
import heroImage from "@/assets/distress.png";

/**
 * The welfare / emergency / distress loan, and the form by which a member
 * applies for one (clause 8.2; form WFR/LOAN/2013).
 *
 * The terms shown alongside the form come from `welfareLoan` in data/benefits
 * so this page can never state a figure the Constitution does not.
 */
export function LoanApplication() {
  return (
    <>
      <PageHero
        breadcrumb="Apply for a loan"
        image={heroImage}
        eyebrow="Welfare loan"
        eyebrowIcon="HandCoins"
        title="Apply for a welfare loan"
        lead="Complete the Society's loan application. You will need your EPF number and the details of one guarantor."
        jumpLinks={[
          { to: "/loans#apply", label: "The application form", icon: "PenLine" },
          { to: "/benefits#loan", label: "Loan terms", icon: "ScrollText" },
        ]}
      />

      <BeforeYouStart />
      <ApplySection />
    </>
  );
}

/* ------------------------------------------------------- Before you start --- */

function BeforeYouStart() {
  const points = [
    {
      icon: "IdCard",
      title: "Your own details",
      text: "EPF number, designation, division and the date you joined the Company. If you are already a member, entering your EPF number fills most of this in.",
    },
    {
      icon: "Handshake",
      title: "A guarantor, under five years",
      text: "Clause 8.2 requires a guarantor from applicants who have completed less than five (5) years of service. You will need their name, NIC or passport number and telephone number.",
    },
    {
      icon: "HandCoins",
      title: "Amount and purpose",
      text: "What the loan is for and how much you are applying for. The Exco considers each application on its merits.",
    },
  ];

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Before you start"
          eyebrowIcon="ClipboardCheck"
          title="What you will need"
          lead="The form takes a few minutes. Nothing is saved until you submit it, so have these to hand."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {points.map((point, i) => (
            <Reveal key={point.title} delay={i * 70}>
              <Card className="h-full">
                <IconTile name={point.icon} size="lg" />
                <h3 className="mt-4 font-display text-base font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        {welfareLoan?.eligibility?.length ? (
          <Reveal>
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <IconTile name="CircleAlert" tone="amber" />
                <div className="min-w-0">
                  <h3 className="m-0 font-display text-base font-semibold">Eligibility</h3>
                  <ul className="m-0 mt-3 list-none space-y-2 p-0">
                    {welfareLoan.eligibility.map((text) => (
                      <li key={text} className="flex items-start gap-2.5">
                        <Icon
                          name="CircleCheck"
                          className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                        />
                        <span className="text-[14.5px] leading-relaxed text-foreground/80">
                          {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- The form --- */

function ApplySection() {
  return (
    <Section muted id="apply">
      <Container>
        <SectionHeading
          eyebrow="Apply"
          eyebrowIcon="PenLine"
          title="Loan application"
          lead="Sections 1 to 5 and 7 of the Society's loan application form. Section 6 is completed by the Exco."
        />

        <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-9 lg:p-10">
          <LoanForm />
        </div>
      </Container>
    </Section>
  );
}
