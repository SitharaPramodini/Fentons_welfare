import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
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
import { Notice, Spinner } from "@/components/ui/form";
import { DownloadApplication } from "@/components/forms/LoanForm";
import heroImage from "@/assets/events/womens-day-hall.jpg";

/**
 * A member's own account: their staff record, their membership, and every
 * loan they have applied for.
 *
 * Everything is read-only. The staff details come from the Company's HR
 * record, which this site only ever reads — a correction has to go to HR, not
 * here, or the two would disagree.
 */
export function Profile() {
  const { profile } = useAuth();
  const [history, setHistory] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let live = true;
    api
      .myHistory()
      .then((r) => {
        if (!live) return;
        setHistory(r.data);
        setState("ready");
      })
      .catch(() => live && setState("error"));
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <PageHero
        breadcrumb="My account"
        image={heroImage}
        eyebrow="My account"
        eyebrowIcon="IdCard"
        title={profile?.calling_name || profile?.full_name || "My account"}
        lead={[profile?.position, profile?.department].filter(Boolean).join(" · ")}
      />

      <Details profile={profile} />
      <Membership history={history} state={state} />
      <Loans history={history} state={state} />
    </>
  );
}

/* --------------------------------------------------------------- Details --- */

function Details({ profile }) {
  if (!profile) return null;

  const rows = [
    ["Full name", profile.full_name],
    ["HRIS number", profile.hris],
    ["EPF number", profile.epf_number],
    ["Designation", profile.position],
    ["Division", profile.department],
    ["Company", profile.company],
    ["Location", profile.location],
    ["Joined the Company", profile.joined_on],
    ["Years of service", profile.service_years],
    ["Contact number", profile.mobile_no],
    ["E-mail", profile.email],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return (
    <Section id="details">
      <Container>
        <SectionHeading
          eyebrow="Your details"
          eyebrowIcon="IdCard"
          title="Staff record"
          lead="These come from the Company's HR record. They cannot be edited here — ask the HR Division to correct anything that is wrong."
        />

        <Reveal className="mt-10">
          <Card hover={false}>
            <div className="flex flex-wrap items-center gap-5">
              <Avatar name={profile.full_name} size="xl" />
              <div className="min-w-0">
                <h3 className="m-0 font-display text-xl font-bold">{profile.full_name}</h3>
                <p className="mt-1 m-0 text-sm text-muted-foreground">
                  {[profile.position, profile.company].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            <dl className="m-0 mt-7 grid gap-x-8 gap-y-0 border-t border-border pt-2 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border py-3"
                >
                  <dt className="font-display text-[12px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                    {label}
                  </dt>
                  <dd className="m-0 text-right font-display text-[14.5px] font-semibold text-ink">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ Membership --- */

const memberTones = {
  pending: { tone: "amber", icon: "Hourglass", label: "Awaiting confirmation" },
  approved: { tone: "emerald", icon: "CircleCheck", label: "Member" },
  rejected: { tone: "rose", icon: "CircleAlert", label: "Not approved" },
};

function Membership({ history, state }) {
  const membership = history?.membership;

  return (
    <Section muted id="membership">
      <Container>
        <SectionHeading eyebrow="Your membership" eyebrowIcon="Users" title="Membership" />

        <div className="mt-10">
          {state === "loading" ? <Loading label="Loading your membership…" /> : null}
          {state === "error" ? (
            <Notice tone="error" title="Could not load your membership">
              <p>
                Please refresh the page. If it keeps happening, tell the Society&rsquo;s office.
              </p>
            </Notice>
          ) : null}

          {state === "ready" && !membership ? (
            <Card hover={false} className="text-center">
              <IconTile name="UserPlus" size="lg" className="mx-auto" />
              <h3 className="mt-5 font-display text-lg font-semibold">You are not yet a member</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Apply to join and the Committee will confirm your membership once the HR Division
                has verified your details.
              </p>
              <Button to="/membership#apply" className="mt-6" iconRight="ArrowRight">
                Apply for membership
              </Button>
            </Card>
          ) : null}

          {membership ? <MembershipCard membership={membership} /> : null}
        </div>
      </Container>
    </Section>
  );
}

function MembershipCard({ membership }) {
  const meta = memberTones[membership.status] ?? memberTones.pending;
  const dependants = [...(membership.parents ?? []), ...(membership.children ?? [])];

  return (
    <Reveal>
      <Card hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <IconTile name={meta.icon} tone={meta.tone} size="lg" />
            <div>
              <p className="m-0 font-display text-[12px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                Status
              </p>
              <p className="mt-1 m-0 font-display text-xl font-bold text-ink">{meta.label}</p>
            </div>
          </div>

          {membership.reference_no ? (
            <div className="rounded-xl border border-border bg-surface px-4 py-2.5 text-right">
              <p className="m-0 font-display text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                Reference
              </p>
              <p className="mt-0.5 m-0 font-display text-[15px] font-bold text-ink tabular-nums">
                {membership.reference_no}
              </p>
            </div>
          ) : null}
        </div>

        <dl className="m-0 mt-7 grid gap-x-8 border-t border-border pt-2 sm:grid-cols-2">
          <Row label="Applied on" value={String(membership.created_at ?? "").slice(0, 10)} />
          <Row label="Membership from" value={membership.membership_effective_from} />
          <Row
            label="Entrance fee"
            value={`Rs. ${Number(membership.joining_fee).toLocaleString("en-LK")}`}
          />
          <Row
            label="Monthly subscription"
            value={`Rs. ${Number(membership.monthly_fee).toLocaleString("en-LK")}`}
          />
          {membership.hr_remarks ? <Row label="Remarks" value={membership.hr_remarks} /> : null}
        </dl>

        {dependants.length > 0 ? (
          <div className="mt-6 border-t border-border pt-5">
            <p className="m-0 font-display text-[12px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Dependants on your form
            </p>
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
              {dependants.map((d) => (
                <li
                  key={`${d.relationship}-${d.full_name}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px]"
                >
                  <span className="font-semibold text-ink">{d.full_name}</span>
                  <span className="text-muted-foreground">{d.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </Reveal>
  );
}

/* ----------------------------------------------------------------- Loans --- */

/* Full class strings, not built with template literals: Tailwind's scanner
 * only sees classes that appear literally in the source. */
const loanTones = {
  submitted: { label: "Submitted", chip: "border-sky-200 bg-sky-50 text-sky-700" },
  under_review: { label: "Under review", chip: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Approved", chip: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  not_approved: { label: "Not approved", chip: "border-rose-200 bg-rose-50 text-rose-700" },
  released: { label: "Released", chip: "border-brand-200 bg-brand-50 text-brand-700" },
  settled: { label: "Settled", chip: "border-slate-200 bg-slate-50 text-slate-700" },
};

function Loans({ history, state }) {
  const loans = history?.loans ?? [];

  return (
    <Section id="loans">
      <Container>
        <SectionHeading
          eyebrow="Your loans"
          eyebrowIcon="HandCoins"
          title="Loan history"
          lead="Every welfare loan you have applied for, and where each one has got to."
        />

        <div className="mt-10">
          {state === "loading" ? <Loading label="Loading your loans…" /> : null}

          {state === "ready" && loans.length === 0 ? (
            <Card hover={false} className="text-center">
              <IconTile name="HandCoins" size="lg" className="mx-auto" />
              <h3 className="mt-5 font-display text-lg font-semibold">No loan applications yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                When you apply for a welfare loan it will appear here, with the Exco&rsquo;s
                decision once it has been taken.
              </p>
              <Button to="/loans" className="mt-6" iconRight="ArrowRight">
                Apply for a loan
              </Button>
            </Card>
          ) : null}

          {loans.length > 0 ? (
            <ul className="m-0 grid list-none gap-4 p-0">
              {loans.map((loan, i) => {
                const meta = loanTones[loan.status] ?? loanTones.submitted;
                return (
                  <Reveal as="li" key={loan.id} delay={i * 60}>
                    <Card hover={false}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="m-0 font-display text-[15px] font-semibold text-ink">
                            {loan.reference_no}
                          </p>
                          <p className="mt-1 m-0 max-w-lg text-sm leading-relaxed text-muted-foreground">
                            {loan.loan_purpose}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="m-0 font-display text-xl font-bold text-ink tabular-nums">
                            Rs. {Number(loan.loan_amount).toLocaleString("en-LK")}
                          </p>
                          <span
                            className={cn(
                              "mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[12px] font-semibold",
                              meta.chip,
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <dl className="m-0 mt-5 grid gap-x-8 border-t border-border pt-2 sm:grid-cols-2">
                        <Row
                          label="Applied on"
                          value={String(loan.created_at ?? "").slice(0, 10)}
                        />
                        {loan.guarantor_name ? (
                          <Row label="Guarantor" value={loan.guarantor_name} />
                        ) : null}
                        {loan.released_on ? (
                          <Row label="Released on" value={loan.released_on} />
                        ) : null}
                        {loan.amount_released ? (
                          <Row
                            label="Amount released"
                            value={`Rs. ${Number(loan.amount_released).toLocaleString("en-LK")}`}
                          />
                        ) : null}
                        {loan.exco_remarks ? (
                          <Row label="Remarks" value={loan.exco_remarks} />
                        ) : null}
                      </dl>
                    </Card>
                  </Reveal>
                );
              })}
            </ul>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- Shared --- */

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border py-3 last:border-0">
      <dt className="font-display text-[12px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="m-0 text-right font-display text-[14.5px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Loading({ label }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-10 text-muted-foreground">
      <Spinner className="text-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
