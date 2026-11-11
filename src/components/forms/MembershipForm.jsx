/**
 * Membership Application Form - WFR/F/09/2020 Rev 02, on screen.
 *
 * The blocks follow the printed form in order: the member's own details, the
 * family block (parents and children), the HR DIVISION block, and finally the
 * two declarations that are signed at the bottom of the page.
 */
import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useForm } from "@/hooks/useForm";
import { usePrefill } from "@/hooks/usePrefill";
import { Icon } from "@/components/ui/Icon";
import { Button, Card } from "@/components/ui/primitives";
import {
  Consent,
  Field,
  FileUpload,
  FormGrid,
  FormSection,
  Notice,
  Select,
  Spinner,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { ConstitutionConsent } from "@/components/forms/ConstitutionConsent";
import { DataConsent } from "@/components/forms/DataConsent";
import {
  childrenRule,
  companies,
  declarations,
  employmentCategories,
  fees,
  forms,
  parentRelationships,
} from "@/data/forms";

const today = () => new Date().toISOString().slice(0, 10);

/* Kept in step with backend/utils/uploads.js. */
const ACCEPT = "application/pdf,image/jpeg,image/png";
const acceptLabel = "JPG or PNG up to 15 MB, or PDF up to 5 MB";
const compressNote =
  "Photographs are compressed to about 100-200 KB once uploaded, so a picture straight from your phone is fine.";

/* A plain counter rather than crypto.randomUUID(), which is unavailable on a
 * plain-HTTP origin - the site may well be served from an internal address.
 * These keys only have to be unique within one mounted form. */
let childKey = 0;
const emptyChild = () => ({ key: `child-${(childKey += 1)}`, full_name: "", date_of_birth: "" });

const initialValues = {
  full_name: "",
  permanent_address: "",
  date_of_birth: "",
  nic_number: "",
  contact_number: "",
  email: "",
  spouse_name: "",
  company: "",
  division: "",
  epf_number: "",
  employment_category: "",
  membership_effective_from: today(),
  declaration_accepted: false,
  payroll_deduction_consent: false,
  constitution_accepted: false,
  data_consent_accepted: false,
};

export function MembershipForm() {
  /* The family block is kept outside useForm: it is two nested shapes rather
   * than flat fields, and it is sent alongside the rest on submit. */
  const [parents, setParents] = useState(() =>
    Object.fromEntries(parentRelationships.map((r) => [r, { full_name: "", nic_number: "" }])),
  );
  const [children, setChildren] = useState(() => [emptyChild()]);

  /* The certificates. Kept outside useForm, which holds only text fields. */
  const [files, setFiles] = useState({
    birth_certificate: null,
    spouse_birth_certificate: null,
    marriage_certificate: null,
  });
  const submitFn = useCallback(
    (values) =>
      api.registerMember(
        {
          ...values,
          email: values.email || null,
          spouse_name: values.spouse_name || null,
          parents,
          children: children
            .filter((c) => c.full_name.trim())
            .map(({ full_name, date_of_birth }) => ({
              full_name,
              date_of_birth: date_of_birth || null,
            })),
        },
        files,
      ),
    [parents, children, files],
  );

  const form = useForm(initialValues, submitFn);
  const { errors, field, submitting } = form;

  /* Choosing a file must also clear that file's error. Uploads do not go
   * through useForm's setValue, so without this the message would stay on
   * screen however many times the member re-attached the document. */
  const setFile = (field_) => (file) => {
    setFiles((prev) => ({ ...prev, [field_]: file }));
    form.setErrors((prev) => {
      if (!(field_ in prev)) return prev;
      const next = { ...prev };
      delete next[field_];
      return next;
    });
  };

  /* Most of this form is already on the member's staff record. */
  const prefill = usePrefill(form.setValues, {
    full_name: "full_name",
    permanent_address: "permanent_address",
    date_of_birth: "date_of_birth",
    nic_number: "nic_number",
    contact_number: "contact_number",
    email: "email",
    division: "division",
    epf_number: "epf_number",
  });

  const resetAll = () => {
    form.reset();
    setParents(
      Object.fromEntries(parentRelationships.map((r) => [r, { full_name: "", nic_number: "" }])),
    );
    setChildren([emptyChild()]);
    setFiles({
      birth_certificate: null,
      spouse_birth_certificate: null,
      marriage_certificate: null,
    });
  };

  /* Things that make the form unsubmittable however it is filled in - the
   * Constitution not being uploaded, for instance. Without this a member
   * could complete the whole form and only find out at the end, from a
   * message about a box they were never shown. */
  const [blockers, setBlockers] = useState({});
  const blockedBy = Object.values(blockers).filter(Boolean);

  /* One stable callback each. A factory called in the markup would return a
   * new function on every render, which is exactly what sent the consent
   * panels into a fetch loop. */
  const onConsentBlocked = useCallback(
    (reason) => setBlockers((prev) => ({ ...prev, consent: reason })),
    [],
  );
  const onConstitutionBlocked = useCallback(
    (reason) => setBlockers((prev) => ({ ...prev, constitution: reason })),
    [],
  );

  /* The spouse's papers are asked for only once a spouse is named. */
  const hasSpouse = String(form.values.spouse_name ?? "").trim().length > 0;

  /* Any error whose key is not a field on screen - shown above the buttons
   * so a validation message can never go unseen. */
  const strayErrors = useMemo(
    () =>
      Object.entries(errors).filter(
        ([key]) => !(key in initialValues) && !(key in files) && !key.startsWith("parent"),
      ),
    [errors, files],
  );

  if (form.succeeded) {
    return <SubmittedPanel result={form.result} message={form.message} onReset={resetAll} />;
  }

  return (
    <form ref={form.formRef} onSubmit={form.submit} noValidate className="space-y-10">
      {blockedBy.length > 0 ? (
        <Notice tone="error" title="This form cannot be submitted at the moment">
          <ul className="m-0 list-disc space-y-1 pl-5">
            {blockedBy.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <p className="mt-2">
            Please tell the Society&rsquo;s office. Nothing you type here will be lost if you come
            back later.
          </p>
        </Notice>
      ) : null}

      {prefill === "filled" ? (
        <Notice tone="info">
          <p>
            Your details have been filled in from your staff record. Please check them and correct
            anything that has changed.
          </p>
        </Notice>
      ) : null}

      {/* --- Member's details ------------------------------------------- */}
      <FormSection step="1" title="Your details">
        <FormGrid>
          <Field label="Name in full" required error={errors.full_name} className="sm:col-span-2">
            {(p) => (
              <TextInput
                {...p}
                {...field("full_name")}
                autoComplete="name"
                placeholder="As it appears on your NIC"
                required
              />
            )}
          </Field>

          <Field
            label="Permanent address"
            required
            error={errors.permanent_address}
            className="sm:col-span-2"
          >
            {(p) => (
              <TextArea
                {...p}
                {...field("permanent_address")}
                autoComplete="street-address"
                rows={2}
                required
              />
            )}
          </Field>

          <Field label="Date of birth" required error={errors.date_of_birth}>
            {(p) => (
              <TextInput {...p} {...field("date_of_birth")} type="date" max={today()} required />
            )}
          </Field>

          <Field label="National Identity Card No" required error={errors.nic_number}>
            {(p) => (
              <TextInput {...p} {...field("nic_number")} placeholder="e.g. 199012345678" required />
            )}
          </Field>

          <Field label="Contact number" required error={errors.contact_number}>
            {(p) => (
              <TextInput
                {...p}
                {...field("contact_number")}
                type="tel"
                autoComplete="tel"
                placeholder="07X XXX XXXX"
                required
              />
            )}
          </Field>

          <Field
            label="E-mail address"
            error={errors.email}
            hint="Optional - used only to acknowledge this application."
          >
            {(p) => <TextInput {...p} {...field("email")} type="email" autoComplete="email" />}
          </Field>
        </FormGrid>
      </FormSection>

      {/* --- Family ------------------------------------------------------ */}
      <FormSection
        step="2"
        title="Family details"
        hint="Leave any box blank if it does not apply. Parents and parents-in-law are recorded if they are alive."
      >
        <FormGrid>
          <Field label="Name of spouse" error={errors.spouse_name} className="sm:col-span-2">
            {(p) => <TextInput {...p} {...field("spouse_name")} />}
          </Field>
        </FormGrid>

        {/* Parents and parents-in-law, with the NIC numbers a death donation
         * claim is later verified against. */}
        <div className="mt-6 space-y-3">
          <p className="m-0 font-display text-[14px] font-semibold text-ink">
            Parents and parents-in-law
          </p>

          {parentRelationships.map((relationship) => (
            <div
              key={relationship}
              className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2"
            >
              <Field label={`${relationship} - name`}>
                {(p) => (
                  <TextInput
                    {...p}
                    name={`parent_${relationship}_name`}
                    value={parents[relationship].full_name}
                    onChange={(e) =>
                      setParents((prev) => ({
                        ...prev,
                        [relationship]: { ...prev[relationship], full_name: e.target.value },
                      }))
                    }
                  />
                )}
              </Field>

              <Field label={`${relationship} - NIC number`}>
                {(p) => (
                  <TextInput
                    {...p}
                    name={`parent_${relationship}_nic`}
                    value={parents[relationship].nic_number}
                    onChange={(e) =>
                      setParents((prev) => ({
                        ...prev,
                        [relationship]: { ...prev[relationship], nic_number: e.target.value },
                      }))
                    }
                    placeholder="e.g. 196012345678"
                  />
                )}
              </Field>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="m-0 font-display text-[14px] font-semibold text-ink">Children</p>
            <p className="m-0 text-[12.5px] text-muted-foreground">{childrenRule}</p>
          </div>

          <div className="mt-3 space-y-3">
            {children.map((child, index) => (
              <div
                key={child.key}
                className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[1fr_auto_auto] sm:items-end"
              >
                <Field label={`Child ${index + 1} - name`}>
                  {(p) => (
                    <TextInput
                      {...p}
                      value={child.full_name}
                      onChange={(e) =>
                        setChildren((prev) =>
                          prev.map((c, i) =>
                            i === index ? { ...c, full_name: e.target.value } : c,
                          ),
                        )
                      }
                    />
                  )}
                </Field>

                <Field label="Date of birth">
                  {(p) => (
                    <TextInput
                      {...p}
                      type="date"
                      max={today()}
                      value={child.date_of_birth}
                      onChange={(e) =>
                        setChildren((prev) =>
                          prev.map((c, i) =>
                            i === index ? { ...c, date_of_birth: e.target.value } : c,
                          ),
                        )
                      }
                    />
                  )}
                </Field>

                <button
                  type="button"
                  onClick={() => setChildren((prev) => prev.filter((_, i) => i !== index))}
                  disabled={children.length === 1}
                  aria-label={`Remove child ${index + 1}`}
                  className="mb-px inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-muted-foreground"
                >
                  <Icon name="X" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setChildren((prev) => [...prev, emptyChild()])}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 font-display text-[13px] font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-100"
          >
            <Icon name="UserPlus" className="h-4 w-4" />
            Add another child
          </button>
        </div>
      </FormSection>

      {/* --- Employment -------------------------------------------------- */}
      <FormSection
        step="3"
        title="Employment details"
        hint="The HR Division verifies these against your personnel record."
      >
        <FormGrid>
          <Field label="Company" required error={errors.company}>
            {(p) => (
              <Select
                {...p}
                {...field("company")}
                options={companies}
                placeholder="Select a company"
                required
              />
            )}
          </Field>

          <Field label="Division" required error={errors.division}>
            {(p) => <TextInput {...p} {...field("division")} required />}
          </Field>

          <Field label="EPF No" required error={errors.epf_number}>
            {(p) => <TextInput {...p} {...field("epf_number")} required />}
          </Field>

          <Field label="Employment category" required error={errors.employment_category}>
            {(p) => (
              <Select
                {...p}
                {...field("employment_category")}
                options={employmentCategories}
                placeholder="Select a category"
                required
              />
            )}
          </Field>
        </FormGrid>
      </FormSection>

      {/* --- Supporting documents ---------------------------------------- */}
      <FormSection
        step="4"
        title="Supporting documents"
        hint={`A scan or a clear photograph is fine. ${acceptLabel}. ${compressNote}`}
      >
        {/* The consent comes before the files: it would be the wrong way
         * round to collect somebody's certificates and ask afterwards. */}
        <DataConsent
          name="data_consent_accepted"
          checked={Boolean(form.values.data_consent_accepted)}
          onChange={(e) => form.setValue("data_consent_accepted", e.target.checked)}
          error={errors.data_consent_accepted}
          onBlocked={onConsentBlocked}
        />

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field
            label="Your birth certificate"
            required
            error={errors.birth_certificate}
            className="sm:col-span-2"
          >
            {() => (
              <FileUpload
                name="birth_certificate"
                accept={ACCEPT}
                file={files.birth_certificate}
                onChange={setFile("birth_certificate")}
                invalid={Boolean(errors.birth_certificate)}
                hint={acceptLabel}
              />
            )}
          </Field>

          {/* Asked for only when a spouse is named: an unmarried applicant
           * has no such papers to give. */}
          {hasSpouse ? (
            <>
              <Field
                label="Your spouse's birth certificate"
                required
                error={errors.spouse_birth_certificate}
              >
                {() => (
                  <FileUpload
                    name="spouse_birth_certificate"
                    accept={ACCEPT}
                    file={files.spouse_birth_certificate}
                    onChange={setFile("spouse_birth_certificate")}
                    invalid={Boolean(errors.spouse_birth_certificate)}
                    hint={acceptLabel}
                  />
                )}
              </Field>

              <Field label="Your marriage certificate" required error={errors.marriage_certificate}>
                {() => (
                  <FileUpload
                    name="marriage_certificate"
                    accept={ACCEPT}
                    file={files.marriage_certificate}
                    onChange={setFile("marriage_certificate")}
                    invalid={Boolean(errors.marriage_certificate)}
                    hint={acceptLabel}
                  />
                )}
              </Field>
            </>
          ) : (
            <p className="m-0 text-[13px] leading-relaxed text-muted-foreground sm:col-span-2">
              Name your spouse in the family details above and you will be asked for their birth
              certificate and your marriage certificate as well.
            </p>
          )}
        </div>
      </FormSection>

      {/* --- Declarations ------------------------------------------------ */}
      <FormSection step="5" title="Declaration">
        <FormGrid>
          <Field
            label="Membership with effect from"
            required
            error={errors.membership_effective_from}
            hint="The date you wish your membership to begin."
          >
            {(p) => (
              <TextInput {...p} {...field("membership_effective_from")} type="date" required />
            )}
          </Field>
        </FormGrid>

        <div className="mt-5 space-y-3">
          <ConstitutionConsent
            name="constitution_accepted"
            checked={Boolean(form.values.constitution_accepted)}
            onChange={(e) => form.setValue("constitution_accepted", e.target.checked)}
            error={errors.constitution_accepted}
            onBlocked={onConstitutionBlocked}
          />

          <Consent
            {...field("declaration_accepted", { type: "checkbox" })}
            error={errors.declaration_accepted}
          >
            {declarations.membership}
          </Consent>

          <Consent
            {...field("payroll_deduction_consent", { type: "checkbox" })}
            error={errors.payroll_deduction_consent}
          >
            {declarations.membershipDeduction}
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
            disabled={submitting || blockedBy.length > 0}
            iconRight={submitting ? undefined : "ArrowRight"}
          >
            {submitting ? <Spinner /> : null}
            {submitting ? "Submitting…" : "Submit application"}
          </Button>

          <button
            type="button"
            onClick={resetAll}
            disabled={submitting}
            className="cursor-pointer font-display text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-brand-800 hover:underline disabled:opacity-50"
          >
            Clear the form
          </button>
        </div>

        <p className="m-0 text-[12.5px] text-muted-foreground">
          Form {forms.membership.code} - Revision {forms.membership.revision}. Fields marked
          <span className="mx-1 text-brand-600">*</span>are required. Your details are sent to the
          Society&rsquo;s office and the HR Division.
        </p>
      </div>
    </form>
  );
}

/* --- After submission ------------------------------------------------------ */

function SubmittedPanel({ result, message, onReset }) {
  return (
    <Card hover={false} className="border-emerald-200 bg-emerald-50/50 p-7 sm:p-9">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon name="CircleCheck" className="h-7 w-7" />
      </span>

      <h3 className="mt-5 font-display text-2xl font-bold">Application received</h3>
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
        <Summary label="Name" value={result?.full_name} />
        <Summary label="EPF No" value={result?.epf_number} />
        <Summary label="Membership from" value={result?.membership_effective_from} />
      </dl>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button to="/benefits" variant="secondary" iconRight="ArrowRight">
          See what membership covers
        </Button>
        <Button as="button" type="button" variant="outline" onClick={onReset}>
          Submit another application
        </Button>
      </div>
    </Card>
  );
}

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
