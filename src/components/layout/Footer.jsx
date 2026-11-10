import { Link } from "@/router";
import { Logo } from "@/components/layout/Logo";
import { visibleNavItems } from "@/components/layout/Header";
import { useAuth } from "@/context/auth";
import { society } from "@/data/society";

/**
 * Identity, the same nav links, and where to find the Society.
 *
 * The address is the registered office from clause 1.1.2. No telephone number
 * or e-mail appears: the Constitution records none, and nothing is invented
 * to fill the space.
 */
export function Footer() {
  const { isSignedIn } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo invert />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">{society.intro}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
              {visibleNavItems(isSignedIn).map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="font-display text-sm font-semibold text-white/65 transition-colors hover:text-brand-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-xs space-y-2 text-sm text-white/55">
            <p className="m-0 font-display text-[13px] font-semibold tracking-[0.12em] text-brand-300 uppercase">
              Registered office
            </p>
            <p className="m-0">{society.registeredOffice}</p>
            <p className="m-0 text-[13px] text-white/40">
              For the employees of {society.parentCompany}.
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-[13px] text-white/40">
          © {year} {society.name}
        </p>
      </div>
    </footer>
  );
}
