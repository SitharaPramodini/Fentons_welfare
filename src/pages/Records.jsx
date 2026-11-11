import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { Card, Container, EmptyState, Section } from "@/components/ui/primitives";
import { Notice, Select, Spinner, TextInput } from "@/components/ui/form";
import heroImage from "@/assets/events/iftar-table-screen.jpg";

/**
 * The Society's records: who consented to what, and what has happened.
 *
 * Read-only by design. Neither the consent register nor the audit trail can
 * be edited or deleted through the site - a trail that can be altered is not
 * a trail.
 */
export function Records() {
  const [tab, setTab] = useState("consents");

  return (
    <>
      <PageHero
        breadcrumb="Records"
        image={heroImage}
        eyebrow="For the Society's office"
        eyebrowIcon="ScrollText"
        title="Consents and audit trail"
        lead="What members have agreed to, in the words they agreed to, and a record of what has happened."
      />

      <Section>
        <Container>
          <div className="flex flex-wrap gap-2">
            {[
              ["consents", "Consent register", "ShieldCheck"],
              ["audit", "Audit trail", "ScrollText"],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-display text-[13.5px] font-semibold transition",
                  tab === key
                    ? "border-brand-700 bg-brand-800 text-white"
                    : "border-border bg-card text-foreground/70 hover:border-brand-400",
                )}
              >
                <Icon name={icon} className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8">{tab === "consents" ? <ConsentRegister /> : <AuditTrail />}</div>
        </Container>
      </Section>
    </>
  );
}

/* ------------------------------------------------------ Consent register --- */

const CONSENT_LABELS = {
  special_personal_data: "Personal documents",
  constitution: "Constitution",
  declaration: "Declaration",
  payroll_deduction: "Salary deduction",
};

function ConsentRegister() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  useEffect(() => setPage(1), [type]);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (type) params.set("type", type);
      const r = await api.consentRecords(`?${params}`);
      setData(r.data);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [type, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function show(id) {
    setOpen({ loading: true });
    try {
      const r = await api.consentRecord(id);
      setOpen(r.data);
    } catch {
      setOpen(null);
    }
  }

  if (state === "loading") return <Loading label="Loading the consent register…" />;
  if (state === "error") return <Failed />;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="m-0 text-sm text-muted-foreground">
          <span className="font-semibold text-ink">{data.total.toLocaleString("en-LK")}</span>{" "}
          consent{data.total === 1 ? "" : "s"} recorded
        </p>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by consent"
          placeholder="All consents"
          options={Object.entries(CONSENT_LABELS).map(([value, label]) => ({ value, label }))}
          className="w-64"
        />
      </div>

      {data.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="ShieldCheck" title="Nothing recorded yet" text="" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["Given", "Member", "Consent", "Version", "From", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 font-display text-[11.5px] font-bold tracking-[0.08em] text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-brand-50/40">
                  <td className="px-5 py-3 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
                    {String(c.granted_at).slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-5 py-3 text-[13.5px] font-medium text-ink">
                    {c.full_name ?? (c.hris ? `HRIS ${c.hris}` : "-")}
                    {c.reference_no ? (
                      <span className="block text-[12px] font-normal text-muted-foreground">
                        {c.reference_no}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-[13px]">
                    {CONSENT_LABELS[c.consent_type] ?? c.consent_type}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-muted-foreground tabular-nums">
                    {c.consent_version}
                  </td>
                  <td className="px-5 py-3 text-[12.5px] text-muted-foreground">
                    {c.ip_address ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => show(c.id)}
                      className="cursor-pointer font-display text-[13px] font-semibold text-brand-700 underline-offset-4 hover:underline"
                    >
                      Read it
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={data.page} pages={data.pages} onChange={setPage} />

      {open ? <ConsentDialog record={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

/** The exact wording somebody agreed to, as it was recorded. */
function ConsentDialog({ record, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-60 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="The consent as recorded"
        className="fixed inset-x-4 top-[8%] z-70 mx-auto max-h-[80vh] max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-7 shadow-2xl sm:inset-x-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="m-0 font-display text-lg font-bold">What was agreed to</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-surface"
          >
            <Icon name="X" className="h-4 w-4" />
          </button>
        </div>

        {record.loading ? (
          <div className="mt-6">
            <Loading label="Loading…" />
          </div>
        ) : (
          <>
            <dl className="m-0 mt-5 grid gap-x-8 border-t border-border pt-2 sm:grid-cols-2">
              <Row label="Consent" value={CONSENT_LABELS[record.consent_type]} />
              <Row label="Version" value={record.consent_version} />
              <Row label="Given" value={String(record.granted_at).slice(0, 19).replace("T", " ")} />
              <Row label="HRIS" value={record.hris} />
              <Row label="From" value={record.ip_address} />
              <Row label="Withdrawn" value={record.withdrawn_at ?? "no"} />
            </dl>

            <div className="mt-6 rounded-xl border border-border bg-surface p-5">
              {String(record.consent_text)
                .split("\n\n")
                .map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="mt-0 mb-3 text-[13.5px] leading-relaxed text-foreground/80 last:mb-0"
                  >
                    {p}
                  </p>
                ))}
            </div>

            <p className="mt-4 m-0 text-[12px] text-muted-foreground">
              This is the wording as it was stored at the time, not today&rsquo;s wording.
            </p>
          </>
        )}
      </div>
    </>
  );
}

/* ----------------------------------------------------------- Audit trail --- */

function AuditTrail() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, action]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "40" });
        if (search.trim()) params.set("search", search.trim());
        if (action) params.set("action", action);
        const r = await api.auditTrail(`?${params}`);
        setData(r.data);
        setState("ready");
      } catch {
        setState("error");
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, action, page]);

  if (state === "loading" && !data) return <Loading label="Loading the audit trail…" />;
  if (state === "error") return <Failed />;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <TextInput
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search what happened, or who did it"
          aria-label="Search the audit trail"
        />
        <Select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          aria-label="Filter by action"
          placeholder="Everything"
          options={(data?.actions ?? []).map((a) => ({
            value: a.action,
            label: `${a.action} (${a.n})`,
          }))}
          className="sm:w-72"
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-ink">{(data?.total ?? 0).toLocaleString("en-LK")}</span>{" "}
        event{data?.total === 1 ? "" : "s"}
      </p>

      {data && data.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="Search" title="Nothing matches" text="" />
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <ul className="m-0 mt-6 grid list-none gap-2 p-0">
          {data.items.map((e, i) => (
            <Reveal as="li" key={e.id} delay={Math.min(i, 10) * 25}>
              <Card hover={false} className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="m-0 text-[13.5px] leading-snug text-foreground/85">{e.summary}</p>
                  <p className="m-0 text-[12px] whitespace-nowrap text-muted-foreground tabular-nums">
                    {String(e.occurred_at).slice(0, 19).replace("T", " ")}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[11px]">
                    {e.action}
                  </span>
                  {e.actor_name || e.actor_hris ? (
                    <span>{e.actor_name ?? `HRIS ${e.actor_hris}`}</span>
                  ) : null}
                  {e.ip_address ? <span>{e.ip_address}</span> : null}
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      ) : null}

      {data ? <Pager page={data.page} pages={data.pages} onChange={setPage} /> : null}
    </>
  );
}

/* ---------------------------------------------------------------- Shared --- */

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-border py-2.5">
      <dt className="font-display text-[11.5px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="m-0 text-right font-display text-[13.5px] font-semibold text-ink">
        {String(value)}
      </dd>
    </div>
  );
}

function Loading({ label }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-muted-foreground">
      <Spinner className="text-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function Failed() {
  return (
    <Notice tone="error" title="Could not load these records">
      <p>Please refresh the page and try again.</p>
    </Notice>
  );
}

function Pager({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-display text-[13px] font-semibold disabled:opacity-40"
      >
        <Icon name="ChevronLeft" className="h-4 w-4" />
        Previous
      </button>
      <span className="font-display text-sm font-semibold text-muted-foreground tabular-nums">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-display text-[13px] font-semibold disabled:opacity-40"
      >
        Next
        <Icon name="ChevronRight" className="h-4 w-4" />
      </button>
    </nav>
  );
}
