# Fentons Welfare Society — website

A light, orange-themed site for the employee welfare society of Fentons Limited.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files land in dist/
npm run preview  # serve the built files locally
```

---

## ⚠️ Before this goes live

The site is complete and working, but the **content is realistic placeholder text, not real
society data**. Everything below needs checking by someone who knows the society.

| What | Where | Currently |
| --- | --- | --- |
| Founding year & date | `src/data/society.js` → `society.establishedYear` / `establishedDate` | `1994` / `1994-04-12` |
| Registration number | `src/data/society.js` → `society.registrationNo` | `FWS/REG/1994/017` |
| Address, phone, hotline, email | `src/data/society.js` → `contact` | Example Colombo details |
| Office bearers (all names) | `src/data/members.js` | Invented names |
| Loan amounts, rates, benefit values | `src/data/services.js` | Example figures |
| Contribution & joining fee | `src/data/society.js` → `membership` | LKR 500 / LKR 1,000 |
| Bank account for donations | `src/data/employees.js` → `donations.bank` | Example account |
| Insurance policy number | `src/data/services.js` → `insurance.policyNo` | Example |
| Logo | `src/components/layout/Logo.jsx` | Inline SVG placeholder |
| All photographs | `src/data/gallery.js` | Styled gradient placeholders |

Lines that need replacing are marked `PLACEHOLDER` in the data files.

**The two forms do not submit anywhere.** Registration and Contact validate properly, then hand
the completed details to the member's email client as a prefilled message to the welfare office.
That works today with no server. To accept submissions properly, POST the `values` object to an
API or Google Form endpoint — see the comment above `SubmittedPanel` in `src/pages/Register.jsx`.

---

## Editing content

**All text lives in `src/data/` — you should rarely need to open a component.**

| File | Controls |
| --- | --- |
| `society.js` | Name, founding date, mission, objectives, goals, society structure, membership, benefits, stats, milestones, contact details |
| `events.js` | Every event. Upcoming vs. past is worked out from the date — just add an event with the right date |
| `celebrations.js` | Weddings, new arrivals, birthdays, retirements |
| `members.js` | Chairman's message, board of directors, sub-committee chairs, trustees |
| `clubs.js` | Sports clubs, youth forum, club membership, fund-raising |
| `services.js` | Welfare loans + eligibility, employee benefits, external club memberships, insurance |
| `news.js` | News stories and announcements |
| `employees.js` | Resignation process, refund rules, donations |
| `gallery.js` | Photo gallery |

### Adding an event

Add an entry to the array in `src/data/events.js`. Nothing else to change:

```js
{
  id: "quiz-night-2027",
  title: "Members' Quiz Night",
  date: "2027-02-20",          // decides upcoming vs. past automatically
  time: "6.30 pm – 9.30 pm",
  venue: "Staff Canteen",
  category: "Social",          // Sports | Social | Community | Meeting | Trip | Awards
  featured: false,             // true pins it to the top and onto the home page
  summary: "Teams of four, with a prize for the winners.",
  details: ["Register your team with the Events Sub-Committee by 10 February."],
  organiser: "Events & Celebrations Sub-Committee",
  contact: "events@fentons.lk",
  cost: "LKR 500 per team",
  accent: "sky",               // amber | rose | sky | emerald | violet | cyan | slate
}
```

### Adding real photos

1. Put image files in `src/assets/gallery/`
2. Import them at the top of `src/data/gallery.js`
3. Set `src` on the matching item:

```js
import sportsMeet from "@/assets/gallery/sports-meet-2026.jpg";

export const gallery = [
  { id: "g1", src: sportsMeet, title: "Annual Sports Meet", /* … */ },
];
```

Any item still on `src: null` keeps its styled placeholder, so you can add photos one at a time.
Board member photos work the same way via the `photo` field in `src/data/members.js`.

### Adding a page

1. Create `src/pages/MyPage.jsx`
2. Add it to `routes` in `src/App.jsx`
3. Add it to `navItems` in `src/components/layout/Header.jsx`

---

## Pages

Home · About · Events · Celebrations · Clubs · Services · Members · News · Employees · Contact,
plus Gallery, Register and a 404 page.

## How it is built

- **Vite + React 19**, plain JavaScript (no TypeScript)
- **Tailwind CSS v4** — the orange palette and all design tokens are at the top of
  `src/styles.css` as `--color-brand-50` … `--color-brand-950`. Change the brand colour there and
  the whole site follows.
- **Custom hash router** (`src/router.jsx`, ~120 lines) instead of React Router. URLs look like
  `/#/events`, which means the built site works on any static host — IIS, Apache, GitHub Pages, a
  network share — with no server rewrite rules to configure.
- **No UI framework.** Shared pieces live in `src/components/ui/`; the 5 original dependencies are
  React, React DOM, lucide-react (icons), clsx and tailwind-merge.

### Accessibility & motion

Keyboard focus rings, a skip-to-content link, labelled form fields with inline errors, ARIA on the
accordion, carousel, lightbox and dialogs. Animations are driven by `.reveal` +
`IntersectionObserver` and are switched off entirely under `prefers-reduced-motion`.
