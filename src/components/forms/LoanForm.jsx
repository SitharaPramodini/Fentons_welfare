/**
 * Loan Application - WFR/LOAN/2013, on screen.
 *
 * Sections follow the printed form: 1 personal, 2 employment, 3 facility
 * required, 4 security (the guarantor), 5 declaration and 7 payroll
 * deduction. Section 6 is FOR OFFICE USE ONLY and deliberately absent - the
 * Exco records its decision through the API, never through this form.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useForm } from "@/hooks/useForm";
import { usePrefill } from "@/hooks/usePrefill";
import { Icon } from "@/components/ui/Icon";
import { Button, Card } from "@/components/ui/primitives";
import {
  Consent,
  Field,
  FormGrid,
  FormSection,
  Notice,
  Select,
  Spinner,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { declarations, forms, identityTypes, titles } from "@/data/forms";

const today = () => new Date().toISOString().slice(0, 10);

const initialValues = {
  /* 1) Personal */
  title: "",
  full_name: "",
  date_of_birth: "",
  identity_type: "NIC",
  identity_number: "",
  telephone: "",
  email: "",

  /* 2) Employment */
  epf_number: "",
  date_joined: "",
  designation: "",
  years_of_service: "",
  division: "",
  date_joined_society: "",

  /* 3) Facility required */
  loan_purpose: "",
  loan_amount: "",

  /* 4) Security - guarantor */
  g_full_name: "",
  g_epf_number: "",
  g_date_joined: "",
  g_division: "",
  g_designation: "",
  g_identity_type: "NIC",
  g_identity_number: "",
  g_telephone: "",
  g_declaration_accepted: false,

  /* 5 and 7) Declarations */
  declaration_accepted: false,
  payroll_deduction_consent: false,
  payroll_deduction_amount: "",
};

/**
 * Renames the server's guarantor error keys to this form's input names:
 * `guarantor.full_name` and `guarantors.0.full_name` both become
 * `g_full_name`.
 *
 * Without this the message could never be cleared. `useForm` clears an error
 * when the input of the same name is edited, so a key that matches no input
 * stays on screen however much the member corrects it - which is exactly how
 * "The guarantor must be someone other than the applicant" came to sit under
 * the name field permanently.
 */
function mapGuarantorErrors(errors) {
  const out = {};
  for (const [key, message] of Object.entries(errors)) {
    const match = /^guarantors?(?:\.\d+)?\.(.+)$/.exec(key);
    out[match ? `g_${match[1]}` : key] = message;
  }
  return out;
}

export function LoanForm() {
  const submitFn = useCallback((values) => {
    /* `identity_type` carries a default, so it does not count as the person
     * having started filling the block in. */
    const guarantorStarted = [
      "g_full_name",
      "g_epf_number",
      "g_date_joined",
      "g_division",
      "g_designation",
      "g_identity_number",
      "g_telephone",
    ].some((key) => String(values[key] ?? "").trim() !== "");

    return api.applyForLoan({
      title: values.title,
      full_name: values.full_name,
      date_of_birth: values.date_of_birth,
      identity_type: values.identity_type,
      identity_number: values.identity_number,
      telephone: values.telephone,
      email: values.email || null,

      epf_number: values.epf_number,
      date_joined: values.date_joined,
      designation: values.designation,
      years_of_service: values.years_of_service || null,
      division: values.division,
      date_joined_society: values.date_joined_society || null,

      loan_purpose: values.loan_purpose,
      loan_amount: values.loan_amount,

      declaration_accepted: values.declaration_accepted,
      payroll_deduction_consent: values.payroll_deduction_consent,
      payroll_deduction_amount: values.payroll_deduction_amount || null,

      guarantor: guarantorStarted
        ? {
            full_name: values.g_full_name,
            epf_number: values.g_epf_number || null,
            date_joined: values.g_date_joined || null,
            division: values.g_division || null,
            designation: values.g_designation || null,
            identity_type: values.g_identity_type,
            identity_number: values.g_identity_number,
            telephone: values.g_telephone,
            declaration_accepted: values.g_declaration_accepted,
          }
        : null,
    });
  }, []);

  const form = useForm(initialValues, submitFn, { mapErrors: mapGuarantorErrors });
  const { errors, field, setValue, submitting, values } = form;

  /* The applicant is whoever is signed in, so their own record fills the
   * form. This replaced an EPF-number lookup, which let anyone pull up a
   * colleague's details by typing their number. */
  const prefill = usePrefill(form.setValues, {
    full_name: "full_name",
    date_of_birth: "date_of_birth",
    identity_number: "identity_number",
    telephone: "telephone",
    email: "email",
    epf_number: "epf_number",
    designation: "designation",
    division: "division",
    date_joined: "date_joined",
  });

  /* Years of service follows from the joining date; it is still editable. */
  const derivedYears = useMemo(() => {
    if (!values.date_joined) return "";
    const joined = new Date(`${values.date_joined}T00:00:00`);
    if (Number.isNaN(joined.getTime())) return "";
    const years = (Date.now() - joined.getTime()) / (365.25 * 24 * 3600 * 1000);
    return years < 0 ? "" : years.toFixed(1);
  }, [values.date_joined]);

  useEffect(() => {
    if (derivedYears && !values.years_of_service) setValue("years_of_service", derivedYears);
  }, [derivedYears, values.years_of_service, setValue]);

  /* Clause 8.2 - a guarantor is required below five years of service. Until
   * the applicant has said how long they have served, the stricter rule is
   * shown, which is also how the backend decides. */
  const years = Number(values.years_of_service || derivedYears);
  const guarantorRequired = !Number.isFinite(years) || years < 5;

  const strayErrors = useMemo(
    () => Object.entries(errors).filter(([key]) => !(key in initialValues)),
    [errors],
  );

  if (form.succeeded) {
    return <SubmittedPanel result={form.result} message={form.message} onReset={form.reset} />;
  }

  return (
    <form ref={form.formRef} onSubmit={form.submit} noValidate className="space-y-10">
      {prefill === "filled" ? (
        <Notice tone="info">
          <p>
            Your details have been filled in from your staff record. Please check them and correct
            anything that has changed.
          </p>
        </Notice>
      ) : null}

      {/* --- 1) Personal details ---------------------------------------- */}
      <FormSection step="1" title="Personal details">
        <FormGrid>
          <Field label="Title" required error={errors.title}>
            {(p) => (
              <Select {...p} {...field("title")} options={titles} placeholder="Select" required />
            )}
          </Field>

          <Field label="Full name" required error={errors.full_name}>
            {(p) => <TextInput {...p} {...field("full_name")} autoComplete="name" required />}
          </Field>

          <Field label="Date of birth" required error={errors.date_of_birth}>
            {(p) => (
              <TextInput {...p} {...field("date_of_birth")} type="date" max={today()} required />
            )}
          </Field>

          <Field label="Telephone" required error={errors.telephone}>
            {(p) => (
              <TextInput
                {...p}
                {...field("telephone")}
                type="tel"
                autoComplete="tel"
                placeholder="07X XXX XXXX"
                required
              />
            )}
          </Field>

          <Field label="Identity document" required error={errors.identity_type}>
            {(p) => <Select {...p} {...field("identity_type")} options={identityTypes} required />}
          </Field>

          <Field
            label={`${values.identity_type || "NIC"} number`}
            required
            error={errors.identity_number}
          >
            {(p) => <TextInput {...p} {...field("identity_number")} required />}
          </Field>

          <Field
            label="E-mail address"
            error={errors.email}
            className="sm:col-span-2"
            hint="Optional - used only to acknowledge this application."
          >
            {(p) => <TextInput {...p} {...field("email")} type="email" autoComplete="email" />}
          </Field>
        </FormGrid>
      </FormSection>

      {/* --- 2) Employment details -------------------------------------- */}
      <FormSection
        step="2"
        title="Employment details"
        hint="Taken from your staff record. Correct anything that has changed."
      >
        <FormGrid>
          <Field label="EPF No" required error={errors.epf_number}>
            {(p) => <TextInput {...p} {...field("epf_number")} required />}
          </Field>

          <Field label="Designation" required error={errors.designation}>
            {(p) => <TextInput {...p} {...field("designation")} required />}
          </Field>

          <Field label="Date joined the Company" required error={errors.date_joined}>
            {(p) => (
              <TextInput {...p} {...field("date_joined")} type="date" max={today()} required />
            )}
          </Field>

          <Field
            label="No of years of service"
            error={errors.years_of_service}
            hint={
              derivedYears ? "Worked out from your joining date - adjust if needed." : undefined
            }
          >
            {(p) => (
              <TextInput
                {...p}
                {...field("years_of_service")}
                type="number"
                step="0.1"
                min="0"
                max="60"
              />
            )}
          </Field>

          <Field label="Division" required error={errors.division}>
            {(p) => <TextInput {...p} {...field("division")} required />}
          </Field>

          <Field label="Date joined the Welfare Society" error={errors.date_joined_society}>
            {(p) => (
              <TextInput {...p} {...field("date_joined_society")} type="date" max={today()} />
            )}
          </Field>
        </FormGrid>
      </FormSection>

      {/* --- 3) Facility required --------------------------------------- */}
      <FormSection step="3" title="Facility required">
        <FormGrid>
          <Field
            label="Purpose of loan"
            required
            error={errors.loan_purpose}
            className="sm:col-span-2"
          >
            {(p) => (
              <TextArea
                {...p}
                {...field("loan_purpose")}
                rows={3}
                placeholder="Why the loan is needed - for example a medical expense, a family emergency or a distress situation."
                required
              />
            )}
          </Field>

          <Field label="Loan amount (Rs.)" required error={errors.loan_amount}>
            {(p) => (
              <TextInput
                {...p}
                {...field("loan_amount")}
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                required
              />
            )}
          </Field>
        </FormGrid>
      </FormSection>

      {/* --- 4) Security ------------------------------------------------- */}
      <FormSection
        step="4"
        title="Security - guarantor"
        hint={
          guarantorRequired
            ? "Clause 8.2 requires a guarantor from applicants with less than five (5) years of service. The guarantor must be someone other than you."
            : "With five or more years of service a guarantor is not required under clause 8.2. You may still name one - leave this section blank if you prefer."
        }
      >
        <FormGrid>
          <Field
            label="Guarantor's full name"
            required={guarantorRequired}
            error={errors.g_full_name}
            className="sm:col-span-2"
          >
            {(p) => <TextInput {...p} {...field("g_full_name")} required={guarantorRequired} />}
          </Field>

          <Field label="EPF No" error={errors.g_epf_number}>
            {(p) => <TextInput {...p} {...field("g_epf_number")} />}
          </Field>

          <Field label="Designation" error={errors.g_designation}>
            {(p) => <TextInput {...p} {...field("g_designation")} />}
          </Field>

          <Field label="Division" error={errors.g_division}>
            {(p) => <TextInput {...p} {...field("g_division")} />}
          </Field>

          <Field label="Date joined" error={errors.g_date_joined}>
            {(p) => <TextInput {...p} {...field("g_date_joined")} type="date" max={today()} />}
          </Field>

          <Field label="Identity document" error={errors.g_identity_type}>
            {(p) => <Select {...p} {...field("g_identity_type")} options={identityTypes} />}
          </Field>

          <Field
            label={`${values.g_identity_type || "NIC"} number`}
            required={guarantorRequired}
            error={errors.g_identity_number}
          >
            {(p) => (
              <TextInput {...p} {...field("g_identity_number")} required={guarantorRequired} />
            )}
          </Field>

          <Field
            label="Telephone"
            required={guarantorRequired}
            error={errors.g_telephone}
            className="sm:col-span-2"
          >
            {(p) => (
              <TextInput {...p} {...field("g_telephone")} type="tel" required={guarantorRequired} />
            )}
          </Field>
        </FormGrid>

        <div className="mt-5">
          <Consent
            {...field("g_declaration_accepted", { type: "checkbox" })}
            error={errors.g_declaration_accepted}
          >
            <strong className="font-semibold">Guarantor&rsquo;s declaration - </strong>
            {declarations.loanGuarantor}
          </Consent>
        </div>
      </FormSection>

      {/* --- 5 and 7) Declarations --------------------------------------- */}
      <FormSection step="5" title="Declaration and payroll deduction">
        <FormGrid>
          <Field
            label="Amount to be deducted monthly (Rs.)"
            error={errors.payroll_deduction_amount}
            hint="Optional - leave blank and the Society will set the instalment."
          >
            {(p) => (
              <TextInput
                {...p}
                {...field("payroll_deduction_amount")}
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
              />
            )}
          </Field>
        </FormGrid>

        <div className="mt-5 space-y-3">
          <Consent
            {...field("declaration_accepted", { type: "checkbox" })}
            error={errors.declaration_accepted}
          >
            {declarations.loan}
          </Consent>

          <Consent
            {...field("payroll_deduction_consent", { type: "checkbox" })}
            error={errors.payroll_deduction_consent}
          >
            {declarations.loanPayroll}
          </Consent>
        </div>
      </FormSection>

      {/* --- Submit ------------------------------------------------------ */}
      <div className="space-y-4">
        {form.status === "error" ? (
          <Notice tone="error" title="This application was not submitted">
            <p>{form.message}</p>
            {strayErrors.length > 0 ? (
              <ul className="mt-2 list-disc space-y-0.5 pl-5">
                {strayErrors.map(([key, text]) => (
                  <li key={key}>{text}</li>
                ))}
              </ul>
            ) : null}
          </Notice>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            iconRight={submitting ? undefined : "ArrowRight"}
          >
            {submitting ? <Spinner /> : null}
            {submitting ? "Submitting…" : "Submit loan application"}
          </Button>

          <button
            type="button"
            onClick={form.reset}
            disabled={submitting}
            className="cursor-pointer font-display text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-brand-800 hover:underline disabled:opacity-50"
          >
            Clear the form
          </button>
        </div>

        <p className="m-0 text-[12.5px] text-muted-foreground">
          Form {forms.loan.code}. Fields marked
          <span className="mx-1 text-brand-600">*</span>are required. The Exco records its decision
          separately; nothing in section 6 of the printed form is filled in here.
        </p>
      </div>
    </form>
  );
}

/* --- After submission ------------------------------------------------------ */

function SubmittedPanel({ result, message, onReset }) {
  const amount = result?.loan_amount
    ? new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2 }).format(
        Number(result.loan_amount),
      )
    : null;

  return (
    <Card hover={false} className="border-emerald-200 bg-emerald-50/50 p-7 sm:p-9">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon name="CircleCheck" className="h-7 w-7" />
      </span>

      <h3 className="mt-5 font-display text-2xl font-bold">Loan application received</h3>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/75">{message}</p>

      {result?.reference_no ? (
        <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-3">
          <span className="font-display text-[12px] font-bold tracking-[0.14em] text-emerald-700 uppercase">
            Reference
          </span>
          <span className="font-display text-lg font-bold text-ink tabular-nums">
            {result.reference_no}
          </span>
        </div>
      ) : null}

      <dl className="mt-7 grid gap-4 border-t border-emerald-200/70 pt-6 sm:grid-cols-3">
        <Summary label="Applicant" value={result?.full_name} />
        <Summary label="Amount applied for" value={amount ? `Rs. ${amount}` : null} />
        <Summary label="Guarantor" value={result?.guarantors?.[0]?.full_name} />
      </dl>

      <p className="mt-7 rounded-xl border border-border bg-white/70 p-4 text-[13.5px] leading-relaxed text-foreground/75">
        Download your completed application, sign it where it says{" "}
        <strong className="text-ink">Signature of Applicant</strong>, have your guarantor sign it,
        and hand it to your divisional representative. The Society&rsquo;s office has been sent a
        copy and will be in touch with the Exco&rsquo;s decision.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <DownloadApplication id={result?.id} reference={result?.reference_no} />
        <Button to="/benefits#loan" variant="secondary" iconRight="ArrowRight">
          Read the loan terms
        </Button>
        <Button as="button" type="button" variant="outline" onClick={onReset}>
          Submit another application
        </Button>
      </div>
    </Card>
  );
}

/**
 * Downloads the filled-in application. It is fetched rather than linked
 * because the route needs the session cookie and answers with a PDF.
 */
function DownloadApplication({ id, reference, variant = "primary" }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");

  async function download() {
    if (busy || !id) return;
    setBusy(true);
    setFailed("");
    try {
      const blob = await api.loanPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reference ?? "loan"}-application.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err) {
      setFailed(err?.message ?? "The application could not be downloaded.");
    } finally {
      setBusy(false);
    }
  }

  if (!id) return null;

  return (
    <span className="inline-flex flex-col gap-1">
      <Button as="button" type="button" variant={variant} onClick={download} disabled={busy}>
        {busy ? <Spinner /> : <Icon name="FileText" className="h-4 w-4" />}
        {busy ? "Preparing…" : "Download the application"}
      </Button>
      {failed ? <span className="text-[12px] text-rose-700">{failed}</span> : null}
    </span>
  );
}

export { DownloadApplication };

function Summary({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-display text-[11.5px] font-bold tracking-[0.12em] text-emerald-800/70 uppercase">
        {label}
      </dt>
      <dd className="mt-1 m-0 font-display text-[15px] font-semibold text-ink">{value}</dd>
    </div>
  );
}
