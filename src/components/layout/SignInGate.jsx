/**
 * Stands in for content that only signed-in members may see.
 *
 * Used two ways: wrapped around a section (the loan terms, the application
 * forms) and as a whole-page guard. It never hints at what is behind it
 * beyond the heading it is given — a visitor is told to sign in, not told
 * what they are missing.
 */
import { useAuth } from "@/context/auth";
import { Icon } from "@/components/ui/Icon";
import { Button, Card } from "@/components/ui/primitives";

export function SignInGate({
  title = "Sign in to continue",
  text = "This part of the site is for employees of the Company. Sign in with your HRIS number.",
  children,
}) {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return (
      <Card hover={false} className="animate-pulse">
        <div className="h-5 w-40 rounded-full bg-surface" />
        <div className="mt-4 h-4 w-full rounded-full bg-surface" />
        <div className="mt-2 h-4 w-2/3 rounded-full bg-surface" />
      </Card>
    );
  }

  if (isSignedIn) return children;

  return (
    <Card hover={false} className="border-brand-200 bg-brand-50/50 text-center">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <Icon name="ShieldCheck" className="h-7 w-7" />
      </span>

      <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-foreground/75">{text}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button to="/login" iconRight="ArrowRight">
          Sign in
        </Button>
      </div>
    </Card>
  );
}
