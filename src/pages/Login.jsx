import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { Link, useRoute } from "@/router";
import { ApiError } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/primitives";
import { Consent, Field, Notice, Spinner, TextInput } from "@/components/ui/form";
import { society } from "@/data/society";
import sidePhoto from "@/assets/events/sports-day-team.jpg";

/**
 * Sign in with an HRIS number.
 *
 * Laid out as two columns rather than behind the usual page banner: this is a
 * utility page, and a full-width hero only pushed the one thing a member came
 * for below the fold. The form sits at the top of the left column; the
 * photograph carries the right.
 *
 * A member has no password of their own until their first sign-in; until then
 * the only one that works is their HRIS number followed by their date of
 * birth. Redeeming it drops straight into the change-password step, which
 * cannot be skipped — that issued password is guessable by anyone who knows
 * when they were born.
 */
export function Login() {
  const { isSignedIn, mustChangePassword } = useAuth();
  const { navigate } = useRoute();

  /* Already signed in and settled: there is nothing to do on this page. */
  useEffect(() => {
    if (isSignedIn && !mustChangePassword) navigate("/profile");
  }, [isSignedIn, mustChangePassword, navigate]);

  return (
    <section className="grid lg:grid-cols-2">
      {/* The form */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14 lg:py-20">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-display text-[13px] font-semibold text-muted-foreground transition hover:text-brand-800"
          >
            <Icon name="ChevronLeft" className="h-4 w-4" />
            Back to the site
          </Link>

          {isSignedIn && mustChangePassword ? <ChangePasswordForm /> : <SignInForm />}
        </div>
      </div>

      {/* The photograph. Hidden below lg, where it would only push the form
       * down the page again. */}
      <div className="relative isolate hidden overflow-hidden lg:block">
        <img src={sidePhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />

        {/* Just enough shading at the foot to carry the caption. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-brand-950/85 via-brand-950/10 to-transparent"
        />

        <div className="relative flex h-full flex-col justify-end p-10 xl:p-14">
          <p className="m-0 max-w-sm font-display text-2xl leading-snug font-bold text-white xl:text-[1.75rem]">
            {society.intro}
          </p>
          <p className="mt-3 m-0 font-display text-[12px] font-bold tracking-[0.16em] text-gold-300 uppercase">
            {society.name}
          </p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Sign in --- */

function SignInForm() {
  const { signIn } = useAuth();
  const [hris, setHris] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setErrors({});
    setMessage("");

    try {
      await signIn(Number(hris), password);
      /* On success the provider flips `isSignedIn`; the page above decides
       * whether to show the change-password step or move on. */
    } catch (err) {
      setErrors(err instanceof ApiError ? (err.fieldErrors ?? {}) : {});
      setMessage(err?.message ?? "Could not sign you in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mt-7 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Sign in
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Members of the {society.name} sign in with their HRIS number.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field label="HRIS number" required error={errors.hris} hint="Your employee number.">
          {(p) => (
            <TextInput
              {...p}
              name="hris"
              value={hris}
              onChange={(e) => setHris(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="username"
              autoFocus
              placeholder="e.g. 30000"
              invalid={Boolean(errors.hris)}
              required
            />
          )}
        </Field>

        <Field label="Password" required error={errors.password}>
          {(p) => (
            <div className="relative">
              <TextInput
                {...p}
                name="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-12"
                invalid={Boolean(errors.password)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-brand-700"
              >
                <Icon name={show ? "EyeOff" : "Eye"} className="h-4 w-4" />
              </button>
            </div>
          )}
        </Field>

        {message ? (
          <Notice tone="error" title="Could not sign you in">
            <p>{message}</p>
          </Notice>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Spinner /> : null}
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-7 rounded-xl border border-border bg-surface p-5">
        <h2 className="m-0 flex items-center gap-2 font-display text-[14px] font-semibold">
          <Icon name="Info" className="h-4 w-4 text-brand-600" />
          Signing in for the first time
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
          Your first password is your <strong className="text-ink">HRIS number</strong> followed by
          your <strong className="text-ink">date of birth as DDMMYYYY</strong>. Someone with HRIS
          30000 born on 19 May 1971 would enter{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[12.5px] text-ink">
            3000019051971
          </code>
          . You will be asked to choose your own password straight away.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          If it does not work, ask the HR Division to check the date of birth they hold for you.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------- Change a password --- */

function ChangePasswordForm() {
  const { profile, refresh, signOut } = useAuth();
  const { navigate } = useRoute();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;

    if (next !== confirm) {
      setErrors({ confirm_password: "The two passwords do not match." });
      return;
    }

    setBusy(true);
    setErrors({});
    setMessage("");

    try {
      const { api } = await import("@/lib/api");
      await api.changePassword({ current_password: current, new_password: next });
      await refresh();
      navigate("/profile");
    } catch (err) {
      setErrors(err instanceof ApiError ? (err.fieldErrors ?? {}) : {});
      setMessage(err?.message ?? "Could not change your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mt-7 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Choose a password
      </h1>

      <Notice
        className="mt-5"
        tone="info"
        title={`Welcome, ${profile?.calling_name || profile?.full_name}`}
      >
        <p>
          The password you were issued is built from your HRIS number and date of birth, both of
          which your colleagues can find out. Please choose one of your own before going on.
        </p>
      </Notice>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <Field label="The password you just used" required error={errors.current_password}>
          {(p) => (
            <TextInput
              {...p}
              name="current_password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              invalid={Boolean(errors.current_password)}
              required
            />
          )}
        </Field>

        <Field
          label="New password"
          required
          error={errors.new_password}
          hint="At least 8 characters, with letters and numbers."
        >
          {(p) => (
            <TextInput
              {...p}
              name="new_password"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              invalid={Boolean(errors.new_password)}
              required
            />
          )}
        </Field>

        <Field label="New password again" required error={errors.confirm_password}>
          {(p) => (
            <TextInput
              {...p}
              name="confirm_password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              invalid={Boolean(errors.confirm_password)}
              required
            />
          )}
        </Field>

        <Consent checked={agreed} onChange={(e) => setAgreed(e.target.checked)} name="agreed">
          I will keep this password to myself and not share it with anyone.
        </Consent>

        {message ? (
          <Notice tone="error" title="Could not change your password">
            <p>{message}</p>
          </Notice>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={busy || !agreed}>
            {busy ? <Spinner /> : null}
            {busy ? "Saving…" : "Save and continue"}
          </Button>

          <button
            type="button"
            onClick={signOut}
            className="cursor-pointer font-display text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-brand-800 hover:underline"
          >
            Sign out instead
          </button>
        </div>
      </form>
    </div>
  );
}
