import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Consent, Notice, Spinner } from "@/components/ui/form";

/**
 * Consent to the Society holding the certificates and identity numbers the
 * membership form collects.
 *
 * The wording is fetched from the server rather than written here. What gets
 * stored in the consent record has to be the same text the member actually
 * read, and it cannot be if the page keeps its own copy that may drift out of
 * step with the server's.
 *
 * The retention period is stated plainly and up front. Somebody handing over
 * their marriage certificate is entitled to know when it will be destroyed
 * without having to ask.
 */
export function DataConsent({ checked, onChange, error, name, onBlocked }) {
  const [consent, setConsent] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error

  /* Held in a ref, not read as a dependency: a parent that builds this
   * callback inline would otherwise change its identity on every render and
   * restart the fetch for ever. */
  const report = useRef(onBlocked);
  report.current = onBlocked;

  useEffect(() => {
    let live = true;
    api
      .consentWording()
      .then((r) => {
        if (!live) return;
        const found = r.data.consents.find((c) => c.key === "special_personal_data");
        setConsent(found ?? null);
        setState(found ? "ready" : "error");
        report.current?.(found ? null : "The consent wording could not be loaded.");
      })
      .catch(() => {
        if (!live) return;
        setState("error");
        report.current?.("The consent wording could not be loaded.");
      });
    return () => {
      live = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        <Spinner className="text-brand-600" />
        Loading the consent wording…
      </div>
    );
  }

  if (state === "error") {
    return (
      <Notice tone="error" title="The consent wording could not be loaded">
        <p>
          This application cannot be submitted without it. Please refresh the page, and tell the
          Society&rsquo;s office if it keeps happening.
        </p>
      </Notice>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Icon name="ShieldCheck" className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h3 className="m-0 font-display text-[15px] font-semibold text-ink">
              {consent.heading}
            </h3>

            {consent.text.split("\n\n").map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-3 m-0 text-[13.5px] leading-relaxed text-foreground/80"
              >
                {paragraph}
              </p>
            ))}

            <p className="mt-4 m-0 text-[12px] text-muted-foreground">
              Version {consent.version}. A record of this consent is kept, including the date and
              the wording above.
            </p>
          </div>
        </div>
      </div>

      <Consent name={name} checked={checked} onChange={onChange} error={error}>
        I have read the above and I consent to the Society collecting and holding these documents
        and details on the terms set out.
      </Consent>
    </div>
  );
}
