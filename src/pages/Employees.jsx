import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/layout/PageHero";
import { Button, Card, Container, EmptyState, Section } from "@/components/ui/primitives";
import { Notice, Select, Spinner, TextInput } from "@/components/ui/form";
import heroImage from "@/assets/employee.png";

/**
 * Who is eligible to join, read from the Company's staff record.
 *
 * Signed-in members only, and deliberately limited: a name, a job title, a
 * division and whether that person has joined the Society. No date of birth,
 * NIC or address - the server does not send them, because a member's first
 * password is built from their HRIS number and date of birth.
 */
export function Employees() {
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error

  /* Reset to the first page whenever the filters change. */
  useEffect(() => setPage(1), [search, company]);

  useEffect(() => {
    api
      .employeeCompanies()
      .then((r) => setCompanies(r.data.companies))
      .catch(() => setCompanies([]));
  }, []);

  /* Debounced so a search does not fire a request per keystroke, and the
   * request is cancelled when a later keystroke supersedes it. Without that
   * cancellation the reply for "sil" can arrive after the reply for "silva"
   * and overwrite the newer results with older ones. */
  const timer = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      setState((s) => (s === "ready" ? "ready" : "loading"));

      const params = new URLSearchParams({ page: String(page), limit: "24" });
      if (search.trim()) params.set("search", search.trim());
      if (company) params.set("company", company);

      try {
        const response = await api.employees(`?${params}`, controller.signal);
        if (controller.signal.aborted) return;
        setData(response.data);
        setState("ready");
      } catch (err) {
        if (err?.name !== "AbortError" && !controller.signal.aborted) setState("error");
      }
    }, 300);

    return () => {
      clearTimeout(timer.current);
      controller.abort();
    };
  }, [search, company, page]);

  const items = data?.items ?? [];

  return (
    <>
      <PageHero
        breadcrumb="Eligible employees"
        image={heroImage}
        eyebrow="Who can join"
        eyebrowIcon="Users"
        title="Eligible employees"
        lead="Every employee of the Company is eligible to join the Society. Search for a colleague to see whether they have."
      />

      <Section>
        <Container>
          {/* Filters, in one row above the list */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Icon
                name="Search"
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <TextInput
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, HRIS number, designation or division"
                aria-label="Search eligible employees"
                className="pl-11"
              />
            </div>

            <Select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-label="Filter by company"
              placeholder="All companies"
              options={companies.map((c) => ({
                value: c.company,
                label: `${c.company} (${c.total})`,
              }))}
              className="sm:w-64"
            />
          </div>

          {/* Result count */}
          <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
            {state === "loading" && !data ? (
              "Searching…"
            ) : data ? (
              <>
                <span className="font-semibold text-ink">{data.total.toLocaleString("en-LK")}</span>{" "}
                {data.total === 1 ? "employee" : "employees"}
                {search.trim() ? ` matching “${search.trim()}”` : ""}
                {company ? ` at ${company}` : ""}
              </>
            ) : null}
          </p>

          {state === "error" ? (
            <Notice tone="error" title="Could not load the list" className="mt-6">
              <p>Please refresh the page and try again.</p>
            </Notice>
          ) : null}

          {state === "loading" && !data ? (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-muted-foreground">
              <Spinner className="text-brand-600" />
              <span className="text-sm">Loading the staff list…</span>
            </div>
          ) : null}

          {data && items.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon="Search"
                title="Nobody matches that search"
                text="Try part of a name, an HRIS number, a designation or a division."
              />
            </div>
          ) : null}

          {items.length > 0 ? (
            <ul className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((person, i) => (
                <Reveal as="li" key={person.hris} delay={Math.min(i, 8) * 40}>
                  <EmployeeCard person={person} />
                </Reveal>
              ))}
            </ul>
          ) : null}

          {data && data.pages > 1 ? (
            <Pager page={data.page} pages={data.pages} onChange={setPage} />
          ) : null}
        </Container>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ Card --- */

const statusChips = {
  approved: { label: "Member", chip: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  pending: { label: "Applied", chip: "border-amber-200 bg-amber-50 text-amber-700" },
  rejected: { label: "Not approved", chip: "border-rose-200 bg-rose-50 text-rose-700" },
};

function EmployeeCard({ person }) {
  const status = statusChips[person.membership_status];

  return (
    <Card className="h-full">
      <div className="flex items-start gap-4">
        <Avatar name={person.calling_name || person.full_name} size="md" />

        <div className="min-w-0 flex-1">
          <h3 className="m-0 font-display text-[15px] leading-snug font-semibold text-ink">
            {person.calling_name || person.full_name}
          </h3>
          {person.position ? (
            <p className="mt-1 m-0 text-[13px] leading-snug text-muted-foreground">
              {person.position}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="m-0 mt-4 grid gap-1.5 border-t border-border pt-4 text-[12.5px]">
        <Line label="HRIS" value={person.hris} />
        <Line label="Division" value={person.department} />
        <Line label="Company" value={person.company} />
      </dl>

      <div className="mt-4">
        {status ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[11.5px] font-semibold",
              status.chip,
            )}
          >
            <Icon name="CircleCheck" className="h-3.5 w-3.5" />
            {status.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-display text-[11.5px] font-semibold text-muted-foreground">
            Not yet a member
          </span>
        )}
      </div>
    </Card>
  );
}

function Line({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="m-0 truncate text-right font-medium text-foreground/80">{String(value)}</dd>
    </div>
  );
}

/* ----------------------------------------------------------------- Pager --- */

function Pager({ page, pages, onChange }) {
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Button
        as="button"
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <Icon name="ChevronLeft" className="h-4 w-4" />
        Previous
      </Button>

      <span className="font-display text-sm font-semibold text-muted-foreground tabular-nums">
        Page {page} of {pages}
      </span>

      <Button
        as="button"
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
        <Icon name="ChevronRight" className="h-4 w-4" />
      </Button>
    </nav>
  );
}
