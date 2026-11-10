# Welfare Society of Fentons - API

Express + MySQL service behind the two application forms on the website:

| Form                   | Code                   | Endpoint        |
| ---------------------- | ---------------------- | --------------- |
| Membership Application | `WFR/F/09/2020 Rev 02` | `/api/members`  |
| Loan Application       | `WFR/LOAN/2013`        | `/api/loans`    |

## Getting started

```bash
cd backend
npm install

cp .env.example .env      # then put the real credentials in .env
npm run db:init           # creates the database and its five tables
npm run dev               # http://localhost:4000
```

`npm run db:init` runs `sql/schema.sql`. Every statement is
`CREATE ... IF NOT EXISTS`, so it is safe to run again. If `DB_NAME` in
`.env` differs from `Welfare_Society_Fentons`, the script uses that name
instead, so the schema and the API always target the same database.

The Vite dev server proxies `/api` here (see `vite.config.js`), so with both
running the site needs no further configuration. For a deployed build where
the API is on another host, set `VITE_API_URL` at the project root instead.

## Layout

```
backend/
├── server.js               Express app, CORS, error handling, startup
├── dbconnection.js         mysql2 pool, query helpers, withTransaction()
├── routers/
│   ├── index.js            mounts everything under /api, plus /health and /meta/options
│   ├── member.router.js
│   └── loan.router.js
├── controllers/
│   ├── member.controller.js
│   └── loan.controller.js
├── utils/
│   ├── validate.js         validation, ApiError, paging, reference numbers
│   └── constants.js        the forms' closed value lists
└── sql/
    ├── schema.sql          the five tables
    └── init.js             runs schema.sql
```

## Tables

| Table                     | What it holds                                              |
| ------------------------- | ---------------------------------------------------------- |
| `members`                 | One membership application per row                          |
| `member_dependants`       | Parents, parents-in-law and children named on the form      |
| `membership_declinations` | The lower half of the form - employees who decline to join  |
| `loan_applications`       | One loan application per row, including the office-use block |
| `loan_guarantors`         | Section 4, the guarantor                                     |

## Endpoints

### Membership

| Method   | Path                         | Purpose                                  |
| -------- | ---------------------------- | ---------------------------------------- |
| `POST`   | `/api/members`               | Submit an application (public)            |
| `POST`   | `/api/members/decline`       | Record a decision not to join (public)    |
| `GET`    | `/api/members/lookup/:epf`   | Pre-fill the loan form (public)           |
| `GET`    | `/api/members`               | List - `?status=&company=&search=&page=`  |
| `GET`    | `/api/members/stats`         | Counts by status                          |
| `GET`    | `/api/members/declinations`  | List declinations                         |
| `GET`    | `/api/members/:id`           | One application with its dependants       |
| `PUT`    | `/api/members/:id`           | Correct an application                    |
| `PATCH`  | `/api/members/:id/status`    | Approve or reject                         |
| `DELETE` | `/api/members/:id`           | Delete (dependants cascade)               |

Approving a member adopts any loan applications already filed under the same
EPF number, linking them to the membership record.

### Loans

| Method   | Path                            | Purpose                                 |
| -------- | ------------------------------- | --------------------------------------- |
| `POST`   | `/api/loans`                    | Submit an application (public)           |
| `GET`    | `/api/loans`                    | List - `?status=&epf=&search=&page=`     |
| `GET`    | `/api/loans/stats`              | Counts and amounts by status             |
| `GET`    | `/api/loans/member/:memberId`   | Every loan filed by one member           |
| `GET`    | `/api/loans/:id`                | One application with its guarantor       |
| `PUT`    | `/api/loans/:id`                | Correct an undecided application         |
| `PATCH`  | `/api/loans/:id/decision`       | Exco Approval - section 6                |
| `PATCH`  | `/api/loans/:id/release`        | Release details - section 6              |
| `PATCH`  | `/api/loans/:id/settle`         | Mark as paid off                         |
| `DELETE` | `/api/loans/:id`                | Delete (guarantor cascades)              |

Section 6 of the loan form is never writable from the public form - only
`/decision` and `/release` set those columns.

## Responses

Success:

```json
{ "success": true, "message": "...", "data": { } }
```

Failure, with per-field messages the forms render under each input:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields.",
  "errors": { "epf_number": "EPF No is required." }
}
```

## Sign-in

Staff sign in with their **HRIS number**, read from `intranet.employee` in the
Company's HR database. That database is read-only to this application;
passwords live in `auth_users` here, keyed by HRIS.

A member has no password until their first sign-in. Until then the only one
that works is:

    <HRIS><date of birth as DDMMYYYY>

    HRIS 30000, born 19 May 1971  ->  3000019051971

Redeeming it stores a bcrypt hash and sets `must_change_password`. Until they
choose their own, the session can reach only `/api/auth/me`,
`/api/auth/me/history` and `/api/auth/change-password` - nothing else.

The session is a JWT in an **httpOnly cookie**, so page scripts cannot read
it. Eight wrong passwords locks the account for fifteen minutes. Sign-in
answers with one message for every failure, so the form cannot be used to
discover which HRIS numbers exist.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/api/auth/login` | `{ hris, password }` |
| `POST` | `/api/auth/logout` | Clears the cookie |
| `GET` | `/api/auth/me` | Staff record of whoever is signed in |
| `GET` | `/api/auth/me/history` | Their membership and loans |
| `POST` | `/api/auth/change-password` | `{ current_password, new_password }` |
| `GET` | `/api/employees` | Eligible list - `?search=&company=&page=` |
| `GET` | `/api/employees/companies` | Filter options |
| `GET` | `/api/employees/prefill` | Own details, for the forms |

`/api/employees` never returns a date of birth, NIC or address. That is
deliberate: the first password is built from the HRIS number and the date of
birth, and the HRIS number is the username, so publishing birthdates would
hand over the account of anyone who has not yet set their own password.

## Notes

- **`JWT_SECRET` must be set in production.** The server refuses to start
  without at least 32 characters. In development it generates a random one per
  boot, which simply signs everyone out on restart.
- **Signing in is not the same as being on the Committee.** Every signed-in
  member can currently reach the administration routes - approving members,
  deciding loans, deleting records. The Society has no roles yet. Add one
  before this is reachable beyond the office network.
- **The database user is very broadly privileged.** The credentials in `.env`
  can see several hundred databases on the shared server, not just these two.
  A dedicated user with `SELECT` on `intranet.employee` and full rights on the
  Society's own schema would contain the damage if this application were ever
  compromised.
- **Clause 8.2 guarantor rule.** A guarantor is required only from applicants
  with less than five (5) years of service. When the years are not stated, the
  stricter rule applies.
- **Policy figures are not enforced.** The Rs. 25,000 ceiling, the Rs. 1,500
  Loan Fund contribution and the two-per-division monthly cap are shown on the
  site but left to the Exco to apply, so a change in policy does not mean a
  code change.
