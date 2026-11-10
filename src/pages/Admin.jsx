import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { Button, Card, Container, EmptyState, IconTile, Section } from "@/components/ui/primitives";
import { Notice, Spinner, TextArea } from "@/components/ui/form";
import heroImage from "@/assets/events/womens-day-speakers.jpg";

/**
 * The Society's office: everything waiting on a decision.
 *
 * Only the people listed in ADMIN_HRIS reach this page. The same decisions
 * can be taken from the links in the notification e-mail — both go through
 * the same code, so neither can decide an application twice.
 */
export function Admin() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await api.pendingApplications();
      setData(r.data);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHero
        breadcrumb="The office"
        image={heroImage}
        eyebrow="For the Society's office"
        eyebrowIcon="ClipboardCheck"
        title="Applications waiting"
        lead="Loan applications awaiting an Exco decision, and membership applications awaiting HR."
        jumpLinks={[{ to: "/records", label: "Consents and audit trail", icon: "ScrollText" }]}
      />

      <Section>
        <Container>
          {notice ? (
            <Notice tone={notice.tone} title={notice.title} className="mb-8">
              <p>{notice.text}</p>
            </Notice>
          ) : null}

          {state === "loading" ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-muted-foreground">
              <Spinner className="text-brand-600" />
              <span className="text-sm">Loading the queue…</span>
            </div>
          ) : null}

          {state === "error" ? (
            <Notice tone="error" title="Could not load the queue">
              <p>Please refresh the page and try again.</p>
            </Notice>
          ) : null}

          {state === "ready" ? (
            <>
              <LoanQueue loans={data.loans} onDone={load} setNotice={setNotice} />
              <MemberQueue members={data.members} />
            </>
          ) : null}
        </Container>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ Loan queue --- */

function LoanQueue({ loans, onDone, setNotice }) {
  return (
    <div>
      <h2 className="m-0 font-display text-xl font-bold">
        Loan applications
        <span className="ml-2 text-muted-foreground tabular-nums">({loans.length})</span>
      </h2>

      {loans.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="CircleCheck"
            title="Nothing waiting"
            text="Every loan application has been dealt with."
          />
        </div>
      ) : (
        <ul className="m-0 mt-6 grid list-none gap-4 p-0">
          {loans.map((loan, i) => (
            <Reveal as="li" key={loan.id} delay={i * 60}>
              <LoanCard loan={loan} onDone={onDone} setNotice={setNotice} />
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}

function LoanCard({ loan, onDone, setNotice }) {
  const [open, setOpen] = useState(null); // null | approve | decline
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);

  async function decide(action) {
    if (busy) return;
    setBusy(true);
    try {
      const r =
        action === "approve"
          ? await api.approveLoan(loan.id, { remarks })
          : await api.declineLoan(loan.id, { remarks });
      setNotice({
        tone: action === "approve" ? "success" : "info",
        title: action === "approve" ? "Approved" : "Answered",
        text: r.message,
      });
      setOpen(null);
      setRemarks("");
      await onDone();
    } catch (err) {
      setNotice({ tone: "error", title: "That did not go through", text: err?.message ?? "" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 font-display text-[15px] font-semibold text-ink">
            {loan.full_name}
            <span className="ml-2 font-normal text-muted-foreground">{loan.reference_no}</span>
          </p>
          <p className="mt-1 m-0 text-[13px] text-muted-foreground">
            {[loan.designation, loan.division, `EPF ${loan.epf_number}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-3 m-0 max-w-xl text-sm leading-relaxed text-foreground/80">
            {loan.loan_purpose}
          </p>
        </div>

        <div className="text-right">
          <p className="m-0 font-display text-2xl font-bold text-ink tabular-nums">
            Rs. {Number(loan.loan_amount).toLocaleString("en-LK")}
          </p>
          <p className="mt-1 m-0 text-[12.5px] text-muted-foreground">
            {loan.years_of_service
              ? `${loan.years_of_service} years of service`
              : "service not stated"}
          </p>
          <p className="mt-0.5 m-0 text-[12.5px] text-muted-foreground">
            {loan.guarantor_name ? `Guarantor: ${loan.guarantor_name}` : "No guarantor required"}
          </p>
        </div>
      </div>

      {open ? (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <label className="mb-2 block font-display text-[13px] font-semibold text-ink">
            {open === "approve"
              ? "A note for the member (optional)"
              : "A note for the member (optional) — it will be included, gently, in the letter"}
          </label>
          <TextArea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              open === "approve"
                ? "Approved at the November meeting."
                : "Leave blank and the standard letter is sent."
            }
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              as="button"
              type="button"
              size="sm"
              variant={open === "approve" ? "primary" : "secondary"}
              disabled={busy}
              onClick={() => decide(open)}
            >
              {busy ? <Spinner /> : null}
              {open === "approve" ? "Confirm approval" : "Confirm, and write kindly"}
            </Button>

            <button
              type="button"
              onClick={() => setOpen(null)}
              className="cursor-pointer font-display text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
          <Button as="button" type="button" size="sm" onClick={() => setOpen("approve")}>
            Approve
          </Button>
          <Button
            as="button"
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen("decline")}
          >
            Not this time
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------- Member queue --- */

function MemberQueue({ members }) {
  return (
    <div className="mt-14">
      <h2 className="m-0 font-display text-xl font-bold">
        Membership applications
        <span className="ml-2 text-muted-foreground tabular-nums">({members.length})</span>
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        These are confirmed by the HR Division once the details have been verified.
      </p>

      {members.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="CircleCheck" title="Nothing waiting" text="" />
        </div>
      ) : (
        <ul className="m-0 mt-6 grid list-none gap-3 p-0">
          {members.map((m, i) => (
            <Reveal as="li" key={m.id} delay={i * 50}>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="min-w-0">
                  <p className="m-0 font-display text-[15px] font-semibold text-ink">
                    {m.full_name}
                    <span className="ml-2 font-normal text-muted-foreground">{m.reference_no}</span>
                  </p>
                  <p className="mt-1 m-0 text-[13px] text-muted-foreground">
                    {[m.company, m.division, `EPF ${m.epf_number}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="text-right text-[12.5px] text-muted-foreground">
                  <IconTile name="Hourglass" tone="amber" size="sm" className="ml-auto" />
                  <p className="mt-2 m-0">from {m.membership_effective_from}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------------------------- Notification button --- */

/**
 * The bell in the header. Shows how many applications are waiting and opens
 * a panel listing them, so the office does not have to go looking.
 */
export function NotificationBell() {
  const [count, setCount] = useState(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    let live = true;
    const poll = () =>
      api
        .pendingApplications()
        .then((r) => {
          if (!live) return;
          setData(r.data);
          setCount(r.data.total);
        })
        .catch(() => live && setCount(null));

    poll();
    /* Light touch: the queue moves in days, not seconds. */
    const timer = setInterval(poll, 120_000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`The Society's office${count ? ` — ${count} waiting` : ""}`}
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-ink transition hover:border-brand-400 hover:bg-brand-50"
      >
        <Icon name="Megaphone" className="h-4 w-4" />
        {count ? (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 font-display text-[11px] font-bold text-brand-950 tabular-nums">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-60 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <aside
            className={cn(
              "fixed inset-y-0 right-0 z-70 w-full max-w-sm overflow-y-auto",
              "border-l border-border bg-background shadow-2xl",
            )}
            aria-label="Applications waiting"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="m-0 font-display text-[15px] font-bold">Waiting for you</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-surface"
              >
                <Icon name="X" className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {!data ? (
                <p className="m-0 text-sm text-muted-foreground">Loading…</p>
              ) : data.total === 0 ? (
                <p className="m-0 text-sm text-muted-foreground">
                  Nothing is waiting. Everything has been dealt with.
                </p>
              ) : (
                <>
                  <Summary
                    icon="HandCoins"
                    label="Loan applications"
                    items={data.loans.map((l) => ({
                      key: l.id,
                      title: l.full_name,
                      meta: `${l.reference_no} · Rs. ${Number(l.loan_amount).toLocaleString("en-LK")}`,
                    }))}
                  />
                  <Summary
                    icon="UserPlus"
                    label="Membership applications"
                    items={data.members.map((m) => ({
                      key: m.id,
                      title: m.full_name,
                      meta: `${m.reference_no} · ${m.division}`,
                    }))}
                  />

                  <Button to="/admin" className="mt-6 w-full" onClick={() => setOpen(false)}>
                    Open the office
                  </Button>
                </>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

function Summary({ icon, label, items }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <p className="m-0 flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
        <Icon name={icon} className="h-3.5 w-3.5" />
        {label} ({items.length})
      </p>
      <ul className="m-0 mt-3 grid list-none gap-2 p-0">
        {items.map((item) => (
          <li key={item.key} className="rounded-xl border border-border bg-card p-3">
            <p className="m-0 font-display text-[13.5px] font-semibold text-ink">{item.title}</p>
            <p className="m-0 text-[12px] text-muted-foreground">{item.meta}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
