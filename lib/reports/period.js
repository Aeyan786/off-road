/**
 * Report periods in UK time (Europe/London — BST/GMT handled), weeks
 * Monday–Sunday. Periods are addressed by a type and an anchor date in the
 * URL (?period=week&date=2026-09-22); every calculation turns them into exact
 * UTC instants so database timestamps (timestamptz) are compared correctly.
 *
 * Pure, so it can run on the server (queries) and the client (labels).
 */

export const TIME_ZONE = "Europe/London";
export const PERIODS = ["day", "week", "month", "year"];
export const PERIOD_LABELS = { day: "Day", week: "Week", month: "Month", year: "Year" };

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Wall-clock parts of an instant in UK time. */
export function londonParts(date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(new Date(date)).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    weekday: WEEKDAYS.indexOf(p.weekday), // 0 = Monday
  };
}

/** The UTC instant of a UK wall-clock time. */
export function londonToUtc(year, month, day, hour = 0) {
  const guess = Date.UTC(year, month - 1, day, hour);
  const offsetAt = (ms) => {
    const p = londonParts(ms);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - ms;
  };
  let t = guess - offsetAt(guess);
  const second = offsetAt(t);
  if (guess - second !== t) t = guess - second;
  return new Date(t);
}

// Calendar arithmetic on plain dates (no time zone involved).
const ymd = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
};
const addDays = (date, n) => ymd(date.year, date.month, date.day + n);
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const pad = (n) => String(n).padStart(2, "0");
export const toDateKey = ({ year, month, day }) => `${year}-${pad(month)}-${pad(day)}`;

export function todayInLondon(now = new Date()) {
  const p = londonParts(now);
  return { year: p.year, month: p.month, day: p.day };
}

function parseDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const date = ymd(Number(match[1]), Number(match[2]), Number(match[3]));
  return toDateKey(date) === value ? date : null;
}

function mondayOf(date) {
  const weekday = (new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7;
  return addDays(date, -weekday);
}

/** First calendar day of the period containing `date`. */
function periodStartDate(type, date) {
  if (type === "day") return date;
  if (type === "week") return mondayOf(date);
  if (type === "month") return ymd(date.year, date.month, 1);
  return ymd(date.year, 1, 1);
}

function shift(type, start, n) {
  if (type === "day") return addDays(start, n);
  if (type === "week") return addDays(start, 7 * n);
  if (type === "month") return ymd(start.year, start.month + n, 1);
  return ymd(start.year + n, 1, 1);
}

function label(type, start) {
  if (type === "day") {
    const weekday = WEEKDAYS[(new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay() + 6) % 7];
    return `${weekday} ${start.day} ${MONTHS_LONG[start.month - 1]} ${start.year}`;
  }
  if (type === "week") {
    const end = addDays(start, 6);
    const left = end.year !== start.year ? `${start.day} ${MONTHS[start.month - 1]} ${start.year}` : end.month !== start.month ? `${start.day} ${MONTHS[start.month - 1]}` : `${start.day}`;
    return `${left} – ${end.day} ${MONTHS[end.month - 1]} ${end.year}`;
  }
  if (type === "month") return `${MONTHS_LONG[start.month - 1]} ${start.year}`;
  return String(start.year);
}

/** Chart buckets for a period: hours of a day, days of a week/month, months of a year. */
function buckets(type, start) {
  if (type === "day") {
    return Array.from({ length: 24 }, (_, h) => ({ key: `h${h}`, label: `${pad(h)}:00`, short: pad(h) }));
  }
  if (type === "week" || type === "month") {
    const count = type === "week" ? 7 : daysInMonth(start.year, start.month);
    return Array.from({ length: count }, (_, i) => {
      const d = addDays(start, i);
      const weekday = WEEKDAYS[(new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay() + 6) % 7];
      return {
        key: toDateKey(d),
        label: `${weekday} ${d.day} ${MONTHS[d.month - 1]}`,
        short: type === "week" ? weekday : String(d.day),
      };
    });
  }
  return MONTHS.map((m, i) => ({ key: `m${i + 1}`, label: `${MONTHS_LONG[i]} ${start.year}`, short: m }));
}

/** Which bucket an instant falls in (UK time). */
export function bucketKey(type, instant) {
  const p = londonParts(instant);
  if (type === "day") return `h${p.hour}`;
  if (type === "year") return `m${p.month}`;
  return toDateKey(p);
}

/**
 * Resolves ?period & ?date into exact ranges.
 * @returns {{type, anchor, label, start: Date, end: Date, previous: {start: Date, end: Date, label},
 *   prevAnchor, nextAnchor|null, isCurrent, buckets, days}}
 */
export function resolvePeriod(typeParam, dateParam, now = new Date()) {
  const type = PERIODS.includes(typeParam) ? typeParam : "month";
  const today = todayInLondon(now);
  const anchorDate = parseDateKey(dateParam) ?? today;

  const startDate = periodStartDate(type, anchorDate);
  const nextStartDate = shift(type, startDate, 1);
  const prevStartDate = shift(type, startDate, -1);
  const toUtc = (d) => londonToUtc(d.year, d.month, d.day);

  const currentStart = periodStartDate(type, today);
  const isCurrent = toDateKey(startDate) === toDateKey(currentStart);
  const isFuture = toUtc(startDate) > toUtc(currentStart);

  return {
    type,
    anchor: toDateKey(startDate),
    label: label(type, startDate),
    start: toUtc(startDate),
    end: toUtc(nextStartDate),
    previous: { start: toUtc(prevStartDate), end: toUtc(startDate), label: label(type, prevStartDate) },
    prevAnchor: toDateKey(prevStartDate),
    nextAnchor: isCurrent || isFuture ? null : toDateKey(nextStartDate),
    todayAnchor: toDateKey(today),
    isCurrent,
    isFuture,
    buckets: buckets(type, startDate),
    // Elapsed days (for rates like "days of stock left"); the current period
    // only counts up to now.
    days: Math.max(
      1 / 24,
      ((isCurrent ? Math.min(now.getTime(), toUtc(nextStartDate).getTime()) : toUtc(nextStartDate).getTime()) - toUtc(startDate).getTime()) / 86400000
    ),
  };
}
