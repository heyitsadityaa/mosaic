export const DEFAULT_TIME_ZONE = "Asia/Kolkata";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type DateParts = {
	year: number;
	month: number;
	day: number;
};

function formatterFor(timeZone: string): Intl.DateTimeFormat {
	try {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	} catch {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone: DEFAULT_TIME_ZONE,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	}
}

function parseDateOnly(value: string): DateParts | null {
	if (!DATE_ONLY_PATTERN.test(value)) return null;

	const [year, month, day] = value.split("-").map(Number);
	const candidate = new Date(Date.UTC(year, month - 1, day));

	if (
		candidate.getUTCFullYear() !== year ||
		candidate.getUTCMonth() !== month - 1 ||
		candidate.getUTCDate() !== day
	) {
		return null;
	}

	return { year, month, day };
}

/**
 * Formats an instant as the calendar date it falls on in the given IANA
 * timezone. Invalid timezones fall back to Asia/Kolkata.
 */
export function dateInTimeZone(date: Date, timeZone: string): string {
	const parts = formatterFor(timeZone).formatToParts(date);
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;
	const day = parts.find((part) => part.type === "day")?.value;

	return `${year}-${month}-${day}`;
}

export function todayInTimeZone(timeZone: string): string {
	return dateInTimeZone(new Date(), timeZone);
}

/** Adds calendar days in UTC, so month and year boundaries stay correct. */
export function addDays(date: string, days: number): string {
	const parsed = parseDateOnly(date);
	if (!parsed) throw new RangeError(`Invalid date: ${date}`);

	const candidate = new Date(
		Date.UTC(parsed.year, parsed.month - 1, parsed.day),
	);
	candidate.setUTCDate(candidate.getUTCDate() + days);

	return candidate.toISOString().slice(0, 10);
}

/** True only for a real YYYY-MM-DD calendar date (rejects 2026-02-31). */
export function isDateOnly(value: string): boolean {
	return parseDateOnly(value) !== null;
}
