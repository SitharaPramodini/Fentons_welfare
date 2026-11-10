/**
 * Who may decide applications.
 *
 * Administrators are listed by HRIS number in `.env`, because the Society has
 * no role-management screen and inventing one would be a bigger thing than
 * this needs. `ADMIN_HRIS=716876,1234` grants two people the Society's
 * administration: the pending queue, approving and declining.
 *
 * Everyone else who signs in is an ordinary member and sees none of it.
 */

export const ADMIN_HRIS = String(process.env.ADMIN_HRIS || "716876")
  .split(",")
  .map((value) => Number(String(value).trim()))
  .filter((value) => Number.isInteger(value) && value > 0);

export function isAdmin(hris) {
  return ADMIN_HRIS.includes(Number(hris));
}
