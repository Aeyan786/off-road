/**
 * The order the disciplines (top-level categories) appear in across the
 * storefront, as specified by the client.
 *
 * This is display order only — it never creates categories. A discipline
 * listed here appears once it exists in the database; a top-level category
 * that isn't listed still shows, after the listed ones, alphabetically. So
 * adding "UTV" in the admin puts it straight into second place with no code
 * change.
 */
export const DISCIPLINE_ORDER = [
  "ATV",
  "UTV",
  "Sport Utility",
  "MX",
  "Enduro",
  "Pit Bike",
  "Street",
  "Harley",
  "Spyder",
  "Truck",
  "Jeep",
  "Snow",
  "PWC",
  "Car",
];

const RANK = new Map(DISCIPLINE_ORDER.map((name, index) => [name.toLowerCase(), index]));

const rankOf = (name) =>
  RANK.get(String(name ?? "").trim().toLowerCase()) ?? DISCIPLINE_ORDER.length;

/** Sorts top-level categories into the client's discipline order. */
export function sortDisciplines(roots = []) {
  return [...roots].sort((a, b) => {
    const diff = rankOf(a.name) - rankOf(b.name);
    return diff !== 0 ? diff : String(a.name).localeCompare(String(b.name));
  });
}
