import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button, Card, Container, Section } from "@/components/ui/primitives";
import { Notice, Spinner, TextArea } from "@/components/ui/form";
import { society } from "@/data/society";

/**
 * Deciding a loan from the link in the notification e-mail.
 *
 * The link does not decide anything on its own. It opens this page, which
 * shows what is about to happen and asks for confirmation — mail scanners and
 * link previewers follow URLs, and an application must never be decided by a
 * spam filter.
 *
 * The token in the link is the authorisation: it names one loan and one
 * action, it expires, and the server refuses it once the loan has been
 * decided. No sign-in is needed, which is the point — the office can answer
 * from a phone.
 */
export function Decision({ token }) {
  const [state, setState] = useState("loading"); // loading | ready | gone | done | error
  const [info, setInfo] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .describeDecision(token)
      .then((r) => {
        if (!live) return;
        setInfo(r.data);
        setState("ready");
      })
      .catch((err) => {
        if (!live) return;
        setMessage(err?.message ?? "That link could not be read.");
        setState(err?.status === 410 ? "gone" : "error");
      });
    return () => {
      live = false;
    };
  }, [token]);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.applyDecision(token, { remarks });
      setMessage(r.message);
      setState("done");
    } catch (err) {
      setMessage(err?.message ?? "That decision could not be recorded.");
      setState("error");
    } finally {
      setBusy(false);
    }
  }

  const approving = info?.action === "approve";

  return (
    <Section>
      <Container className="max-w-2xl">
        {state === "loading" ? (
          <Shell>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Spinner className="text-brand-600" />
              <span className="text-sm">Checking the link…</span>
            </div>
          </Shell>
        ) : null}

        {state === "gone" || state === "error" ? (
          <Shell>
            <Notice tone="error" title="This link cannot be used">
              <p>{message}</p>
            </Notice>
            <Button to="/admin" className="mt-6" iconRight="ArrowRight">
              Sign in and decide from the site
            </Button>
          </Shell>
        ) : null}

        {state === "done" ? (
          <Shell>
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Icon name="CircleCheck" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold">
              Done, and the member has been told
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">{message}</p>
            <Button to="/admin" className="mt-6" iconRight="ArrowRight">
              See what else is waiting
            </Button>
          </Shell>
        ) : null}

        {state === "ready" && info ? (
          <Shell>
            <p className="m-0 font-display text-[12px] font-bold tracking-[0.14em] text-brand-700 uppercase">
              {society.name}
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
              {approving ? "Approve this loan?" : "Answer this application?"}
            </h1>

            <dl className="m-0 mt-7 grid gap-x-8 border-t border-border pt-2 sm:grid-cols-2">
              <Row label="Reference" value={info.loan.reference_no} />
              <Row label="Applicant" value={info.loan.full_name} />
              <Row label="EPF No" value={info.loan.epf_number} />
              <Row label="Division" value={info.loan.division} />
              <Row
                label="Amount"
                value={`Rs. ${Number(info.loan.loan_amount).toLocaleString("en-LK")}`}
              />
              <Row
                label="Service"
                value={
                  info.loan.years_of_service ? `${info.loan.years_of_service} years` : "not stated"
                }
              />
              <Row label="Guarantor" value={info.loan.guarantor_name ?? "not required"} />
              <Row label="Purpose" value={info.loan.loan_purpose} />
            </dl>

            {!info.decidable ? (
              <Notice tone="info" title="Already dealt with" className="mt-7">
                <p>
                  This application is marked &ldquo;{info.loan.status.replace(/_/g, " ")}&rdquo;, so
                  there is nothing left to decide.
                </p>
              </Notice>
            ) : (
              <>
                <div className="mt-7">
                  <label className="mb-2 block font-display text-[13px] font-semibold text-ink">
                    A note for the member (optional)
                  </label>
                  <TextArea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      approving
                        ? "Approved at the November meeting."
                        : "Leave blank and the standard letter is sent."
                    }
                  />
                </div>

                <Notice tone="info" className="mt-5">
                  <p>
                    {approving
                      ? "The member will be told how to print the application, collect the signatures and hand it in."
                      : "The member will be written to kindly, told that the Fund could not reach everyone this month, and invited to apply again."}
                  </p>
                </Notice>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button as="button" type="button" size="lg" disabled={busy} onClick={confirm}>
                    {busy ? <Spinner /> : null}
                    {approving ? "Yes, approve it" : "Yes, answer it kindly"}
                  </Button>
                  <Button to="/admin" variant="outline" size="lg">
                    Not now
                  </Button>
                </div>
              </>
            )}
          </Shell>
        ) : null}
      </Container>
    </Section>
  );
}

function Shell({ children }) {
  return (
    <Card hover={false} className="p-7 sm:p-10">
      {children}
    </Card>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border py-3">
      <dt className="font-display text-[12px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="m-0 max-w-sm text-right font-display text-[14.5px] font-semibold text-ink">
        {value}
      </dd>
    </div>
  );
}
