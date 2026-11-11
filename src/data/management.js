/* ===========================================================================
 * CORPORATE MANAGEMENT - the leadership of Hayleys Fentons Limited.
 *
 * This is the Company's management, not the Welfare Society's Committee of
 * Management (which is appointed by Senior Management and names no members in
 * the Constitution). The two are separate bodies and the site says so.
 *
 * PHOTOGRAPHS
 * -----------
 * Drop a photograph into  src/assets/co-management/  named after the person's
 * first name, lower case - for example  hasith.jpg  or  roshani.png.
 * Accepted: .jpg .jpeg .png .webp
 *
 * Nothing else needs editing: the file is picked up automatically below. A
 * person with no photograph yet shows their initials on a soft brand
 * gradient, so the grid never looks broken.
 *
 * If a filename cannot match the first name (two people sharing one, or a
 * different spelling), set `photoKey` on that person to the filename without
 * its extension.
 * =========================================================================== */

/* Vite resolves this at build time; an empty folder is not an error. */
const files = import.meta.glob("../assets/co-management/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  import: "default",
});

const photos = Object.fromEntries(
  Object.entries(files).map(([path, src]) => [
    path
      .split("/")
      .pop()
      .replace(/\.[^.]+$/, "")
      .toLowerCase(),
    src,
  ]),
);

/** Looks up a photograph by `photoKey`, else by first name. */
function photoFor(person) {
  const key = (person.photoKey ?? person.name.split(" ")[0]).toLowerCase();
  return photos[key] ?? null;
}

/* Listed in the order supplied by the Company. `role` is the title and
 * `unit` the business it covers, kept apart so the cards can set them
 * differently rather than relying on a dash. */
const people = [
  { name: "Hasith Prematillake", role: "Managing Director" },
  { name: "Sujith De Alwis", role: "Deputy Managing Director", unit: "Projects" },
  { name: "Roshane Perera", role: "Deputy Managing Director", unit: "Energy" },
  { name: "Pamudith Gunawardana", role: "Executive Director" },
  { name: "Roshani Dharmaratne", role: "Executive Director", unit: "Hayleys Mobility" },
  { name: "Clyed Gabriel", role: "Chief Operating Officer", unit: "Hayleys Electronics" },
  { name: "Jayendra Fonseka", role: "General Manager", unit: "Security and Communication" },
  {
    name: "Yoosoof Ihthisham",
    role: "General Manager",
    unit: "Fentons Information Technology",
  },
  { name: "Ruwan Kumara", role: "General Manager", unit: "Supply Chain" },
  { name: "Lalani Weeraarachchi", role: "General Manager", unit: "Human Resources" },
  { name: "Mahesh Abeywickrama", role: "General Manager", unit: "Engineering" },
  { name: "Panduka Rathnayake", role: "General Manager", unit: "Finance" },
  {
    name: "Ruwini Silva",
    role: "General Manager",
    unit: "Corporate Affairs and Contract Administration",
  },
  { name: "Dilshan Nanayakkara", role: "Chief Operating Officer", unit: "Energy" },
  {
    name: "Nanduni Dahanayaka",
    role: "Deputy General Manager",
    unit: "Marketing and Corporate Communications",
  },
];

export const corporateManagement = people.map((person) => ({
  ...person,
  photo: photoFor(person),
}));

/** True once at least one photograph has been added - used to pick a layout. */
export const hasManagementPhotos = corporateManagement.some((p) => p.photo);
