import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import {
  BrushEdge,
  Button,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { amendment, membership, objectives, society } from "@/data/society";
import { committee, committeeFunctions, meetings } from "@/data/governance";
import { deathDonations, welfareLoan } from "@/data/benefits";

import heroPhoto from "@/assets/events/iftar-group-photo.jpg";
import archPhoto from "@/assets/events/netball-team.jpg";
import insetPhoto from "@/assets/events/womens-day-gift.jpg";
import cardDeath from "@/assets/events/iftar-colleagues.jpg";
import cardLoan from "@/assets/events/cricket-batting.jpg";
import cardActivities from "@/assets/events/womens-day-hall.jpg";
import facePhoto1 from "@/assets/events/womens-day-portrait.jpg";
import facePhoto2 from "@/assets/events/cricket-team-selfie.jpg";
import facePhoto3 from "@/assets/events/sports-day-team.jpg";

/**
 * The home page states what the Society is, what it set out to do, what it
 * pays and who runs it — all of it from the Reformed Constitution.
 */
export function Home() {
  return (
    <>
      <Hero />
      <AboutBlock />
      <Figures />
      <WhatItProvides />
      <Governance />
      <ConstitutionCta />
    </>
  );
}

/* ---------------------------------------------------------------- Hero --- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <img
        src={heroPhoto}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-brand-950 via-brand-950/80 to-brand-950/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-96 w-96 rounded-full border border-gold-400/20"
      />

      <Container className="relative py-20 sm:py-28 lg:py-36">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow invert>Looking after our own</Eyebrow>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-4 text-balance font-display text-4xl leading-[1.05] font-extrabold text-white sm:text-5xl lg:text-[3.9rem]">
              The Welfare Society
              <br />
              of <span className="text-gradient-brand">Fentons</span>
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70">
              {society.intro}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button to="/membership" size="lg" iconRight="ArrowRight">
                Membership
              </Button>

              {/* Faces from the Society's own activities, with a real figure. */}
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 py-2 pr-5 pl-2 backdrop-blur-sm">
                <span className="flex -space-x-3">
                  {[facePhoto1, facePhoto2, facePhoto3].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      aria-hidden="true"
                      className="h-9 w-9 rounded-full border-2 border-brand-950 object-cover"
                    />
                  ))}
                </span>
                <span className="leading-tight">
                  <span className="block font-display text-[15px] font-extrabold text-gold-300">
                    Rs. 50,000
                  </span>
                  <span className="block text-[11.5px] text-white/60">Death donation, member</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      <BrushEdge />
    </section>
  );
}

/* --------------------------------------------------------- About block --- */

const TABS = [
  {
    id: "objectives",
    label: "Objectives",
    points: objectives.map((o) => o.text),
  },
  {
    id: "membership",
    label: "Membership",
    points: membership.eligibility,
  },
  {
    id: "amendment",
    label: "Amendment",
    points: amendment.slice(0, 3),
  },
];

function AboutBlock() {
  const [tab, setTab] = useState(TABS[0].id);
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <Section>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image cluster */}
          <Reveal className="relative">
            <div className="relative mx-auto max-w-md lg:mx-0">
              <div
                aria-hidden="true"
                className="bg-dots-gold absolute -bottom-6 -left-6 h-28 w-28 rounded-2xl"
              />

              <img
                src={archPhoto}
                alt="Members of the Society at a welfare activity"
                className="shape-arch relative aspect-3/4 w-full object-cover shadow-card"
              />

              {/* Gold figure badge */}
              <div className="absolute -top-4 -right-2 rounded-2xl bg-gold-400 px-5 py-3 text-center shadow-gold sm:-right-6">
                <p className="m-0 font-display text-2xl leading-none font-extrabold text-brand-950">
                  2 yrs
                </p>
                <p className="m-0 mt-1 text-[11px] font-semibold text-brand-900/70">
                  Committee term
                </p>
              </div>

              {/* Inset second photo */}
              <div className="absolute -bottom-8 -right-4 w-36 overflow-hidden rounded-3xl border-4 border-background shadow-card sm:w-44">
                <img src={insetPhoto} alt="" aria-hidden="true" className="aspect-4/3 w-full object-cover" />
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="About the Society"
                title="Run for the people who work here"
                lead={society.governedBy}
              />
            </Reveal>

            {/* Tabs */}
            <Reveal delay={80}>
              <div
                role="tablist"
                aria-label="About the Society"
                className="mt-8 inline-flex flex-wrap gap-2 rounded-full border border-border bg-surface p-1.5"
              >
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={t.id === tab}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "cursor-pointer rounded-full px-5 py-2 font-display text-[13.5px] font-semibold transition-all duration-300",
                      t.id === tab
                        ? "bg-brand-800 text-white shadow-brand"
                        : "text-muted-foreground hover:text-brand-800",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Reveal>

            <ul className="m-0 mt-7 grid list-none gap-3.5 p-0">
              {active.points.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400">
                    <Icon name="CircleCheck" className="h-3.5 w-3.5 text-brand-950" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-foreground/80">{text}</span>
                </li>
              ))}
            </ul>

            <Reveal delay={120}>
              <div className="mt-9">
                <Button to="/about" iconRight="ArrowRight">
                  Read the Constitution
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------- Figures --- */

const FIGURES = [
  { icon: "HeartHandshake", value: "Rs. 50,000", label: "Death donation, member" },
  { icon: "HandCoins", value: "Rs. 25,000", label: "Welfare loan ceiling" },
  { icon: "Percent", value: "5%", label: "Fixed loan interest" },
  { icon: "Hourglass", value: "10 months", label: "Loan repayment period" },
];

function Figures() {
  return (
    <Section className="pt-0">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 80}>
              <div className="text-center">
                <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-brand-300 bg-brand-50">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-soft">
                    <Icon name={f.icon} className="h-6 w-6 text-brand-700" />
                  </span>
                </span>
                <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-brand-800">
                  {f.value}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">{f.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------ What it provides --- */

const PROVISIONS = [
  {
    no: "01",
    photo: cardDeath,
    title: "Death donation benefits",
    text: `Rs. ${deathDonations.rows[0].amount.toLocaleString("en-US")} for a member, Rs. ${deathDonations.rows[1].amount.toLocaleString("en-US")} for a spouse, Rs. ${deathDonations.rows[2].amount.toLocaleString("en-US")} for a child or parent.`,
    to: "/benefits#death-donation",
  },
  {
    no: "02",
    photo: cardLoan,
    title: welfareLoan.name,
    text: "Up to Rs. 25,000/- at 5% fixed interest, repaid over ten months from the date of release.",
    to: "/benefits#loan",
  },
  {
    no: "03",
    photo: cardActivities,
    title: "Welfare activities and facilities",
    text: "Existing activities continue on their approved terms, subject to availability of funds and Company approval.",
    to: "/benefits#other",
  },
];

function WhatItProvides() {
  return (
    <section className="bg-forest relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
      <BrushEdge position="top" />

      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            invert
            eyebrow="Clause 8"
            title="What the Society provides"
            className="max-w-xl"
          />

          <Reveal delay={90}>
            <div className="max-w-sm">
              <p className="m-0 text-[15px] leading-relaxed text-white/60">
                The approved benefit schedule, retained in full under the reformed Constitution.
              </p>
              <Button to="/benefits" variant="onDark" size="sm" iconRight="ArrowRight" className="mt-5">
                All benefits
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROVISIONS.map((p, i) => (
            <Reveal key={p.no} delay={i * 90}>
              <Link
                to={p.to}
                className="group relative block h-80 overflow-hidden rounded-3xl shadow-card"
              >
                <img
                  src={p.photo}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-950/55 to-brand-950/5" />

                <span className="absolute top-4 right-4 rounded-full bg-gold-400 px-3 py-1 font-display text-[11px] font-extrabold tracking-wider text-brand-950">
                  No — {p.no}
                </span>

                <span className="absolute inset-x-0 bottom-0 block p-6">
                  <span className="block font-display text-lg leading-snug font-bold text-white">
                    {p.title}
                  </span>
                  <span className="mt-2 block text-[13px] leading-relaxed text-white/65">
                    {p.text}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      <BrushEdge />
    </section>
  );
}

/* ---------------------------------------------------------- Governance --- */

function Governance() {
  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Who they are */}
          <div className="flex flex-col">
            <Reveal>
              <SectionHeading
                eyebrow="Clauses 4 to 6"
                title="The Committee of Management"
                lead={committee.remit}
              />
            </Reveal>

            {/* Clause 6 — meeting facts, set as a divided strip rather than tiles */}
            <Reveal delay={110}>
              <dl className="mt-10 grid gap-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
                {meetings.facts.map((f) => (
                  <div key={f.label} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                    <dt className="flex items-center gap-2">
                      <Icon name={f.icon} className="h-4 w-4 text-gold-600" />
                      <span className="text-[10.5px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                        {f.label}
                      </span>
                    </dt>
                    <dd className="m-0 mt-2.5 font-display text-[15px] leading-snug font-bold text-balance text-ink">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={200} className="mt-auto">
              <div className="pt-10">
                <Button to="/about#committee" variant="outline" iconRight="ArrowRight">
                  How it is appointed
                </Button>
              </div>
            </Reveal>
          </div>

          {/* What the Committee does — a numbered rail, read top to bottom */}
          <Reveal delay={90}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold-400" aria-hidden="true" />
              <p className="m-0 text-[10.5px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                Clause 5 — what the Committee does
              </p>
            </div>

            <ol className="relative m-0 mt-7 list-none p-0">
              <span
                aria-hidden="true"
                className="absolute top-6 bottom-6 left-[21px] w-px bg-linear-to-b from-gold-400 via-border to-transparent"
              />

              {committeeFunctions.slice(0, 6).map((f, i) => (
                <li
                  key={f.text}
                  className="group relative flex items-start gap-5 py-4 transition-transform duration-300 first:pt-0 last:pb-0 hover:translate-x-1"
                >
                  <span className="relative z-1 mt-0.5 grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border border-gold-200 bg-gold-50 text-gold-700 transition-colors duration-300 group-hover:border-gold-400 group-hover:bg-gold-400 group-hover:text-brand-950">
                    <Icon name={f.icon} className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="font-display text-[10.5px] font-extrabold tracking-[0.14em] text-gold-700/70 uppercase">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="m-0 mt-1 text-[13.5px] leading-relaxed text-foreground/75">
                      {f.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------------- CTA --- */

function ConstitutionCta() {
  return (
    <Section className="pt-0">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-900 px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="bg-dots-gold absolute inset-0 opacity-30" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-10 h-60 w-60 rounded-full border border-gold-400/20"
            />

            <div className="relative">
              <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-400">
                <Icon name="ScrollText" className="h-7 w-7 text-brand-950" />
              </span>

              <h2 className="mt-6 text-balance font-display text-3xl font-extrabold text-white sm:text-4xl">
                {society.constitution.title},{" "}
                <span className="text-gold-300">Version {society.constitution.version}</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/65">
                Everything on this site is taken from the Constitution of the {society.name} — the
                objectives, the benefit amounts, the loan conditions and the rules the Committee of
                Management works to.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button to="/about" size="lg" iconRight="ArrowRight">
                  Read the Constitution
                </Button>
                <Button to="/photos" size="lg" variant="onDark">
                  Welfare activities
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
