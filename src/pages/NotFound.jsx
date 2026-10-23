import { Link } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { Button, Container, IconTile, Section } from "@/components/ui/primitives";

const SUGGESTIONS = [
  { to: "/about", label: "The Society", icon: "Landmark" },
  { to: "/benefits", label: "Benefits and facilities", icon: "HandCoins" },
  { to: "/membership", label: "Membership", icon: "IdCard" },
  { to: "/photos", label: "Photos", icon: "Camera" },
];

export function NotFound() {
  return (
    <Section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <IconTile name="Search" size="lg" className="mx-auto" />

          <p className="mt-6 font-display text-6xl font-extrabold text-brand-200">404</p>

          <h1 className="mt-2 text-balance font-display text-3xl font-extrabold sm:text-4xl">
            We could not find that page
          </h1>

          <p className="mt-4 text-[15.5px] leading-relaxed text-muted-foreground">
            The link may be out of date, or the page may have moved.
          </p>

          <ul className="mt-8 m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <Icon name={s.icon} className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="flex-1 text-[14px] font-medium text-foreground/85">
                    {s.label}
                  </span>
                  <Icon
                    name="ChevronRight"
                    className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <Button to="/" size="lg" className="mt-9" icon="ArrowRight">
            Back to the home page
          </Button>
        </div>
      </Container>
    </Section>
  );
}
