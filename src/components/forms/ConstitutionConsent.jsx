import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Consent, Notice, Spinner } from "@/components/ui/form";
import { society } from "@/data/society";

/**
 * Read the Constitution, then agree to abide by it.
 *
 * The agreement cannot be ticked until the document has actually been opened.
 * That is a nudge rather than proof - nobody can verify that a PDF was read -
 * but it stops the box being ticked past without the link ever being noticed,
 * which is the realistic failure.
 *
 * The file is confidential, so it is fetched from the authenticated API and
 * handed to the browser as a blob rather than linked from the public folder.
 */
export function ConstitutionConsent({ checked, onChange, error, name, onBlocked }) {
  const [state, setState] = useState("checking"); // checking | ready | missing
  const [updatedAt, setUpdatedAt] = useState(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [failed, setFailed] = useState("");

  /* Held in a ref, not read as a dependency: a parent that builds this
   * callback inline would otherwise change its identity on every render and
   * restart the fetch for ever. */
  const report = useRef(onBlocked);
  report.current = onBlocked;

  useEffect(() => {
    let live = true;
    api
      .constitutionStatus()
      .then((r) => {
        if (!live) return;
        setState(r.data.available ? "ready" : "missing");
        setUpdatedAt(r.data.updated_at);
        report.current?.(
          r.data.available
            ? null
            : "The Constitution has not been uploaded yet, so nobody can agree to it.",
        );
      })
      .catch(() => {
        if (!live) return;
        setState("missing");
        report.current?.("The Constitution could not be loaded.");
      });
    return () => {
      live = false;
    };
  }, []);

  async function open() {
    if (opening) return;
    setOpening(true);
    setFailed("");

    try {
      const blob = await api.constitutionFile();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      /* Released once the new tab has had time to take it. */
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setOpened(true);
    } catch (err) {
      setFailed(err?.message ?? "The Constitution could not be opened.");
    } finally {
      setOpening(false);
    }
  }

  if (state === "checking") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        <Spinner className="text-brand-600" />
        Looking for the Constitution…
      </div>
    );
  }

  if (state === "missing") {
    return (
      <Notice tone="error" title="The Constitution is not available">
        <p>
          The document has not been uploaded yet, so this application cannot be submitted. Please
          tell the Society&rsquo;s office.
        </p>
      </Notice>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Icon name="ScrollText" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="m-0 font-display text-[14px] font-semibold text-ink">
              Constitution of the {society.name}
            </p>
            <p className="m-0 text-[12.5px] text-muted-foreground">
              {updatedAt ? `PDF · updated ${updatedAt}` : "PDF"} · confidential, for employees of
              the Company
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={open}
          disabled={opening}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-brand-300 bg-card px-4 py-2 font-display text-[13px] font-semibold text-brand-800 transition hover:border-brand-600 hover:bg-brand-50 disabled:opacity-60"
        >
          {opening ? (
            <Spinner className="text-brand-700" />
          ) : (
            <Icon name="ExternalLink" className="h-4 w-4" />
          )}
          {opened ? "Open it again" : "Read the Constitution"}
        </button>
      </div>

      {failed ? (
        <Notice tone="error">
          <p>{failed}</p>
        </Notice>
      ) : null}

      <Consent
        name={name}
        checked={checked}
        onChange={onChange}
        error={error}
        disabled={!opened}
        hint={opened ? undefined : "Open the Constitution above before you agree to it."}
      >
        I have read the Constitution of the {society.name} and I agree to abide by it on obtaining
        membership.
      </Consent>
    </div>
  );
}
