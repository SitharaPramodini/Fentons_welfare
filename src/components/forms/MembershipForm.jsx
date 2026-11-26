/**
 * Membership Application & Declaration Form - WSF/01/2026 Revision 01
 * (19/11/2026), on screen.
 *
 * The blocks follow the printed form in order: employee information, parent
 * details, civil status and the spouse / parents-in-law block that depends
 * on it, eligible children, the supporting documents from the checklist at
 * the foot of the form, and finally the two declarations that are signed at
 * the bottom of the page.
 *
 * Civil status is the switch for the spouse half of the form: say Married
 * and the spouse, parents-in-law and the three marriage documents appear;
 * say anything else and they are neither shown nor asked for. The server
 * applies the same rule, so the two cannot drift apart.
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
  civilStatuses,
  companies,
  declarations,
  employmentCategories,
  forms,
  genders,
  inLawRelationships,
  maxChildren,
  membershipDocuments,
  membershipEffectiveFrom,
  parentRelationships,
} from "@/data/forms";

const today = () => new Date().toISOString().slice(0, 10);

/* The parents block is the two of them; the in-laws belong to the spouse
 * block below and only appear with it. */
const parentsOnly = parentRelationships.filter((r) => !inLawRelationships.includes(r));

const emptyParents = () =>
  Object.fromEntries(parentRelationships.map((r) => [r, { full_name: "", nic_number: "" }]));

/** The upload field a given child's birth certificate goes on. */
const childCertificateField = (position) => `child_birth_certificate_${position}`;

/* The fixed half of the checklist, as a lookup. */
const DOCUMENT_FIELDS = Object.fromEntries(membershipDocuments.map((d) => [d.field, d]));

/**
 * Turns what is on screen into the fields the API expects.
 *
 * A child's certificate is held against that child's own key while the form
 * is being filled in, not against a row number - rows can be removed, and a
 * certificate must not end up attached to a different child because the one
 * above them was deleted. The numbering is worked out here, at the last
 * moment, from the children who were actually named.
 *
 * Documents belonging to a part of the form that does not apply are left
 * behind rather than uploaded.
 */
function filesToSend(files, namedChildren, married) {
  const out = {
    id_card: files.id_card ?? null,
    birth_certificate: files.birth_certificate ?? null,
  };

  if (married) {
    out.spouse_id_card = files.spouse_id_card ?? null;
    out.spouse_birth_certificate = files.spouse_birth_certificate ?? null;
    out.marriage_certificate = files.marriage_certificate ?? null;
  }

  namedChildren.forEach((child, i) => {
    out[childCertificateField(i + 1)] = files[child.key] ?? null;
  });

  return out;
}

/* Kept in step with backend/utils/uploads.js. */
const ACCEPT = "application/pdf,image/jpeg,image/png";
const acceptLabel = "JPG or PNG up to 15 MB, or PDF up to 5 MB";
const compressNote =
  "Photographs are compressed to about 100-200 KB once uploaded, so a picture straight from your phone is fine.";

/* A plain counter rather than crypto.randomUUID(), which is unavailable on a
 * plain-HTTP origin - the site may well be served from an internal address.
 * These keys only have to be unique within one mounted form. */
let childKey = 0;
const emptyChild = () => ({
  key: `child-${(childKey += 1)}`,
  full_name: "",
  gender: "",
  date_of_birth: "",
});

const initialValues = {
  full_name: "",
  calling_name: "",
  permanent_address: "",
  date_of_birth: "",
  nic_number: "",
  contact_number: "",
  email: "",
  civil_status: "",
  spouse_name: "",
  spouse_nic_number: "",
  company: "",
  division: "",
  designation: "",
  epf_number: "",
  employment_category: "",
  membership_effective_from: membershipEffectiveFrom,
  declaration_accepted: false,
  payroll_deduction_consent: false,
  constitution_accepted: false,
  data_consent_accepted: false,
};

export function MembershipForm() {
  /* The family block is kept outside useForm: it is two nested shapes rather
   * than flat fields, and it is sent alongside the rest on submit. */
  const [parents, setParents] = useState(emptyParents);
  const [children, setChildren] = useState(() => [emptyChild()]);

  /* The documents. Kept outside useForm, which holds only text fields. */
  const [files, setFiles] = useState({});

  const submitFn = useCallback(
    (values) => {
      const married = values.civil_status === "Married";
      const named = children.filter((c) => c.full_name.trim());

      /* Nothing from the spouse half is sent unless it applies: a detail
       * typed and then thought better of should not be filed because the
       * box it was typed in has since been hidden. */
      const family = married
        ? parents
        : Object.fromEntries(parentsOnly.map((r) => [r, parents[r]]));

      return api.registerMember(
        {
          ...values,
          email: values.email || null,
          spouse_name: married ? values.spouse_name : null,
          spouse_nic_number: married ? values.spouse_nic_number || null : null,
          parents: family,
          children: named.map(({ full_name, gender, date_of_birth }) => ({
            full_name,
            gender: gender || null,
            date_of_birth: date_of_birth || null,
          })),
        },
        filesToSend(files, named, married),
      );
    },
    [parents, children, files],
  );

  const form = useForm(initialValues, submitFn);
  const { errors, field, submitting } = form;

  /**
   * Choosing a file must also clear that file's error. Uploads do not go
   * through useForm's setValue, so without this the message would stay on
   * screen however many times the member re-attached the document.
   *
   * A child's certificate is held under the child's own key but reported
   * against the numbered field the server saw, so the two can differ.
   */
  const setFile =
    (key, errorKey = key) =>
    (file) => {
      setFiles((prev) => ({ ...prev, [key]: file }));
      form.setErrors((prev) => {
        if (!(errorKey in prev)) return prev;
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    };

  /* Most of this form is already on the member's staff record. */
  const prefill = usePrefill(form.setValues, {
    full_name: "full_name",
    calling_name: "calling_name",
    permanent_address: "permanent_address",
    date_of_birth: "date_of_birth",
    nic_number: "nic_number",
    contact_number: "contact_number",
    email: "email",
    division: "division",
    designation: "designation",
    epf_number: "epf_number",
  });

  const resetAll = () => {
    form.reset();
    setParents(emptyParents());
    setChildren([emptyChild()]);
    setFiles({});
  };

  /* Removing a child takes their certificate with them. Leaving the file
   * behind would send it under whichever row took that child's place. */
  const removeChild = (index) => {
    const gone = children[index];
    setChildren((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => {
      if (!(gone.key in prev)) return prev;
      const next = { ...prev };
      delete next[gone.key];
      return next;
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

  /* Civil status governs the whole spouse half of the form. */
  const married = form.values.civil_status === "Married";

  /* The children who have been named, in order. Their place in this list is
   * the row number the server knows them by, so it is also how an error
   * about a certificate finds its way back to the right child. */
  const namedChildren = useMemo(() => children.filter((c) => c.full_name.trim()), [children]);
  const childFieldFor = useCallback(
    (child) => {
      const position = namedChildren.indexOf(child);
      return position === -1 ? null : childCertificateField(position + 1);
    },
    [namedChildren],
  );

  /* Any error whose key is not a field on screen - shown above the buttons
   * so a validation message can never go unseen. */
  const strayErrors = useMemo(
    () =>
      Object.entries(errors).filter(
        ([key]) =>
          !(key in initialValues) &&
          !(key in files) &&
          !key.startsWith("parent") &&
          !key.startsWith("child_birth_certificate_") &&
          !(key in DOCUMENT_FIELDS),
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

      {/* --- Employee information ---------------------------------------- */}
      <FormSection step="1" title="Employee information">
        <FormGrid>
          <Field
            label="Full name (as per NIC)"
            required
            error={errors.full_name}
            className="sm:col-span-2"
          >
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
            label="Calling name"
            required
            error={errors.calling_name}
            hint="The name you are known by at work."
          >
            {(p) => (
              <TextInput {...p} {...field("calling_name")} autoComplete="nickname" required />
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

          <Field label="NIC number" required error={errors.nic_number}>
            {(p) => (
              <TextInput {...p} {...field("nic_number")} placeholder="e.g. 199012345678" required />
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

      {/* --- Parent details ---------------------------------------------- */}
      <FormSection
        step="2"
        title="Parent details"
        hint="Recorded if they are living. Leave a row blank if it does not apply."
      >
        <div className="space-y-3">
          {parentsOnly.map((relationship) => (
            <PersonRow
              key={relationship}
              label={relationship}
              person={parents[relationship]}
              onChange={(patch) =>
                setParents((prev) => ({
                  ...prev,
                  [relationship]: { ...prev[relationship], ...patch },
                }))
              }
            />
          ))}
        </div>
      </FormSection>

      {/* --- Civil status, spouse and parents-in-law ---------------------- */}
      <FormSection
        step="3"
        title="Civil status"
        hint="Your spouse and parents-in-law are asked for only if you are married."
      >
        <FormGrid>
          <Field label="Civil status" required error={errors.civil_status}>
            {(p) => (
              <Select
                {...p}
                {...field("civil_status")}
                options={civilStatuses}
                placeholder="Select your civil status"
                required
              />
            )}
          </Field>
        </FormGrid>

        {married ? (
          <div className="mt-6 space-y-3">
            <p className="m-0 font-display text-[14px] font-semibold text-ink">
              Spouse and parents-in-law
            </p>

            <div className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2">
              <Field label="Spouse - full name" required error={errors.spouse_name}>
                {(p) => <TextInput {...p} {...field("spouse_name")} required />}
              </Field>

              <Field label="Spouse - NIC number" error={errors.spouse_nic_number}>
                {(p) => (
                  <TextInput
                    {...p}
                    {...field("spouse_nic_number")}
                    placeholder="e.g. 199012345678"
                  />
                )}
              </Field>
            </div>

            {inLawRelationships.map((relationship) => (
              <PersonRow
                key={relationship}
                label={`${relationship.replace(/-In-Law/, "-in-law")} (if living)`}
                person={parents[relationship]}
                onChange={(patch) =>
                  setParents((prev) => ({
                    ...prev,
                    [relationship]: { ...prev[relationship], ...patch },
                  }))
                }
              />
            ))}
          </div>
        ) : null}
      </FormSection>

      {/* --- Eligible children / dependants ------------------------------- */}
      <FormSection step="4" title="Eligible children / dependants" hint={childrenRule}>
        <div className="space-y-3">
          {children.map((child, index) => (
            <div
              key={child.key}
              className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[1.4fr_0.8fr_1fr_auto] sm:items-end"
            >
              <Field label={`Child ${index + 1} - full name`}>
                {(p) => (
                  <TextInput
                    {...p}
                    value={child.full_name}
                    onChange={(e) =>
                      setChildren((prev) =>
                        prev.map((c, i) => (i === index ? { ...c, full_name: e.target.value } : c)),
                      )
                    }
                  />
                )}
              </Field>

              <Field label="Gender">
                {(p) => (
                  <Select
                    {...p}
                    value={child.gender}
                    options={genders}
                    placeholder="-"
                    onChange={(e) =>
                      setChildren((prev) =>
                        prev.map((c, i) => (i === index ? { ...c, gender: e.target.value } : c)),
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
                onClick={() => removeChild(index)}
                disabled={children.length === 1}
                aria-label={`Remove child ${index + 1}`}
                className="mb-px inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-muted-foreground"
              >
                <Icon name="X" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {children.length < maxChildren ? (
          <button
            type="button"
            onClick={() => setChildren((prev) => [...prev, emptyChild()])}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 font-display text-[13px] font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-100"
          >
            <Icon name="UserPlus" className="h-4 w-4" />
            Add another child
          </button>
        ) : (
          <p className="mt-3 m-0 text-[12.5px] text-muted-foreground">
            The form has {maxChildren} rows for children. If you have more, please tell the
            Society&rsquo;s office once this application is in.
          </p>
        )}

        {errors.children ? (
          <p className="mt-3 m-0 text-[13px] font-medium text-rose-700">{errors.children}</p>
        ) : null}
      </FormSection>

      {/* --- Employment -------------------------------------------------- */}
      <FormSection
        step="5"
        title="Employment details"
        hint="The HR Division verifies these against your personnel record."
      >
        <FormGrid>
          <Field label="Company / entity" required error={errors.company}>
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

          <Field label="Designation" required error={errors.designation}>
            {(p) => <TextInput {...p} {...field("designation")} required />}
          </Field>

          <Field label="EPF number" required error={errors.epf_number}>
            {(p) => <TextInput {...p} {...field("epf_number")} required />}
          </Field>

          <Field
            label="Employment category"
            required
            error={errors.employment_category}
            className="sm:col-span-2"
          >
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
        step="6"
        title="Supporting documents"
        hint={`The checklist at the foot of the form. A scan or a clear photograph is fine. ${acceptLabel}. ${compressNote}`}
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
          {membershipDocuments
            .filter((doc) => doc.when === "always" || married)
            .map((doc) => (
              <Field key={doc.field} label={doc.label} required error={errors[doc.field]}>
                {() => (
                  <FileUpload
                    name={doc.field}
                    accept={ACCEPT}
                    file={files[doc.field]}
                    onChange={setFile(doc.field)}
                    invalid={Boolean(errors[doc.field])}
                    hint={acceptLabel}
                  />
                )}
              </Field>
            ))}

          {!married ? (
            <p className="m-0 text-[13px] leading-relaxed text-muted-foreground sm:col-span-2">
              Set your civil status to Married above and you will be asked for your spouse&rsquo;s
              identity card and birth certificate, and your marriage certificate, as well.
            </p>
          ) : null}
        </div>

        {/* One certificate per child named above, so the office can see at a
         * glance which child each belongs to. */}
        {namedChildren.length > 0 ? (
          <div className="mt-8">
            <p className="m-0 font-display text-[14px] font-semibold text-ink">
              Children&rsquo;s birth certificates
            </p>

            <div className="mt-3 grid gap-5 sm:grid-cols-2">
              {namedChildren.map((child) => {
                const name = childFieldFor(child);
                return (
                  <Field key={child.key} label={child.full_name} required error={errors[name]}>
                    {() => (
                      <FileUpload
                        name={name}
                        accept={ACCEPT}
                        file={files[child.key]}
                        onChange={setFile(child.key, name)}
                        invalid={Boolean(errors[name])}
                        hint={acceptLabel}
                      />
                    )}
                  </Field>
                );
              })}
            </div>
          </div>
        ) : null}
      </FormSection>

      {/* --- Declarations ------------------------------------------------ */}
      <FormSection step="7" title="Declaration">
        <FormGrid>
          <Field
            label="Membership with effect from"
            required
            error={errors.membership_effective_from}
            hint="This intake takes effect on 1 January 2027. Change it only if the Society has agreed another date with you."
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

/* --- Pieces ---------------------------------------------------------------- */

/**
 * One row of either family table: a name and an NIC number.
 *
 * Both tables on the form have the same two columns, so they share a row.
 * Neither is required - a parent who has died is simply left blank.
 */
function PersonRow({ label, person, onChange }) {
  const slug = label.toLowerCase().replace(/[^a-z]+/g, "_");

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2">
      <Field label={`${label} - full name`}>
        {(p) => (
          <TextInput
            {...p}
            name={`family_${slug}_name`}
            value={person.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
          />
        )}
      </Field>

      <Field label={`${label} - NIC number`}>
        {(p) => (
          <TextInput
            {...p}
            name={`family_${slug}_nic`}
            value={person.nic_number}
            onChange={(e) => onChange({ nic_number: e.target.value })}
            placeholder="e.g. 196012345678"
          />
        )}
      </Field>
    </div>
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
