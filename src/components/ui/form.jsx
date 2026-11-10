/**
 * Form controls for the two application forms.
 *
 * They follow the same shapes as the rest of the site - soft corners, forest
 * green focus ring, gold accents - and every one of them takes an `error`
 * string that the backend's field-error map feeds straight into.
 */
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/* --- Form chrome ---------------------------------------------------------- */

/** A numbered block of the form, mirroring the sections on the paper version. */
export function FormSection({ step, title, hint, children, className }) {
  return (
    <fieldset className={cn("m-0 min-w-0 border-0 p-0", className)}>
      <legend className="mb-1 flex w-full items-center gap-3 p-0">
        {step ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800 font-display text-[13px] font-bold text-white tabular-nums">
            {step}
          </span>
        ) : null}
        <span className="font-display text-lg font-semibold text-ink">{title}</span>
      </legend>
      {hint ? <p className="mt-1 mb-5 text-sm text-muted-foreground">{hint}</p> : null}
      <div className={cn(!hint && "mt-5")}>{children}</div>
    </fieldset>
  );
}

/** Responsive two-column grid; children opt out with `className="sm:col-span-2"`. */
export function FormGrid({ children, className }) {
  return <div className={cn("grid gap-x-5 gap-y-4 sm:grid-cols-2", className)}>{children}</div>;
}

/* --- Field wrapper -------------------------------------------------------- */

const controlBase =
  "w-full rounded-xl border bg-card px-4 text-[15px] text-foreground shadow-sm transition-colors " +
  "placeholder:text-muted-foreground/60 focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground";

const controlState = (invalid) =>
  invalid
    ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
    : "border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

/**
 * Label + control + hint + error. Pass the control as a render prop so it
 * receives the generated id and the right aria-* wiring:
 *
 *   <Field label="EPF No" required error={errors.epf_number}>
 *     {(props) => <input {...props} value={...} onChange={...} />}
 *   </Field>
 */
export function Field({ label, hint, error, required, className, children, htmlFor }) {
  const generated = useId();
  const id = htmlFor ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const controlProps = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    "aria-required": required || undefined,
  };

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className="mb-1.5 block font-display text-[13.5px] font-semibold text-ink"
      >
        {label}
        {required ? (
          <span className="ml-1 text-brand-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {typeof children === "function" ? children(controlProps) : children}

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-[12.5px] text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-rose-700">
          <Icon name="CircleAlert" className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* --- Controls ------------------------------------------------------------- */

export function TextInput({ invalid, className, ...rest }) {
  return <input className={cn(controlBase, controlState(invalid), "h-12", className)} {...rest} />;
}

export function TextArea({ invalid, className, rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      className={cn(controlBase, controlState(invalid), "resize-y py-3 leading-relaxed", className)}
      {...rest}
    />
  );
}

export function Select({ invalid, className, options = [], placeholder, children, ...rest }) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlBase,
          controlState(invalid),
          "h-12 cursor-pointer appearance-none pr-10",
          className,
        )}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
        {children}
      </select>
      <Icon
        name="ChevronDown"
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/**
 * Consent checkbox carrying a quoted declaration. The whole block is the
 * label, so the (long) wording is clickable.
 */
export function Consent({ id, checked, onChange, error, children, name, disabled, hint }) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <div>
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4 transition-colors",
          disabled ? "cursor-not-allowed border-border bg-surface/60 opacity-70" : "cursor-pointer",
          error
            ? "border-rose-300 bg-rose-50/50"
            : checked
              ? "border-brand-300 bg-brand-50/60"
              : !disabled && "border-border bg-surface hover:border-brand-300",
        )}
      >
        <input
          id={inputId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-700 disabled:cursor-not-allowed"
        />
        <span className="text-[13.5px] leading-relaxed text-foreground/80">{children}</span>
      </label>

      {hint && !error ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-[12.5px] text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-rose-700"
        >
          <Icon name="CircleAlert" className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* --- File input ----------------------------------------------------------- */

/**
 * Attaches one document.
 *
 * A bare `<input type="file">` cannot be styled and gives no feedback once a
 * file is chosen, so the real input is hidden behind a label and the chosen
 * file is shown back with its size and a way to remove it.
 */
export function FileUpload({ id, name, accept, file, onChange, invalid, hint }) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <div>
      <input
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />

      {file ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-card p-3",
            invalid ? "border-rose-300" : "border-brand-200",
          )}
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon name="FileText" className="h-5 w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[13.5px] font-semibold text-ink">
              {file.name}
            </span>
            <span className="block text-[12px] text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </span>

          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${file.name}`}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700"
          >
            <Icon name="X" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition-colors",
            invalid
              ? "border-rose-300 bg-rose-50/40"
              : "border-border bg-surface hover:border-brand-400 hover:bg-brand-50/50",
          )}
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-brand-600">
            <Icon name="Package" className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[13.5px] font-semibold text-ink">
              Choose a file
            </span>
            {hint ? <span className="block text-[12px] text-muted-foreground">{hint}</span> : null}
          </span>
        </label>
      )}
    </div>
  );
}

/* --- Feedback ------------------------------------------------------------- */

const noticeTones = {
  error: {
    wrap: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "text-rose-600",
    name: "CircleAlert",
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    name: "CircleCheck",
  },
  info: {
    wrap: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    name: "Info",
  },
};

export function Notice({ tone = "info", title, children, className }) {
  const t = noticeTones[tone] ?? noticeTones.info;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl border p-4", t.wrap, className)}
    >
      <Icon name={t.name} className={cn("mt-0.5 h-5 w-5 shrink-0", t.icon)} />
      <div className="min-w-0 text-sm leading-relaxed">
        {title ? <p className="m-0 font-display font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-1", "[&_p]:m-0")}>{children}</div> : null}
      </div>
    </div>
  );
}

/** Spinner shown inside the submit button while a form is in flight. */
export function Spinner({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
