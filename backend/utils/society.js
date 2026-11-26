/**
 * Contact details for the Society's office bearers.
 *
 * These live here, on the server, rather than in the site's data files -
 * deliberately. Anything in the frontend is compiled into the JavaScript
 * bundle, which is served to everyone; hiding it behind a signed-in check in
 * the page would stop a person seeing it but not a scraper reading the
 * source. An address that must only reach members has to be fetched from a
 * route that asks who is asking.
 *
 * The names themselves stay in `src/data/governance.js`: they are printed on
 * the page for everybody, and there is nothing to protect.
 */

export const OFFICE_BEARER_CONTACTS = {
  president: {
    email: process.env.PRESIDENT_EMAIL || "tharindu.chanaka@hayleysfentons.com",
  },
  secretary: {
    email: process.env.SECRETARY_EMAIL || null,
  },
  treasurer: {
    email: process.env.TREASURER_EMAIL || null,
  },
};

/** Only the bearers who actually have something to show. */
export function officeBearerContacts() {
  return Object.fromEntries(
    Object.entries(OFFICE_BEARER_CONTACTS).filter(([, details]) =>
      Object.values(details).some(Boolean),
    ),
  );
}
