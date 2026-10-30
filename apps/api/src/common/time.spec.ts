import {
	addDays,
	DEFAULT_TIME_ZONE,
	dateInTimeZone,
	isDateOnly,
	todayInTimeZone,
} from "./time.js";

describe("time helpers", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns today in Asia/Kolkata", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-10-29T20:00:00.000Z"));

		expect(todayInTimeZone("Asia/Kolkata")).toBe("2026-10-30");
	});

	it("crosses year boundaries in addDays", () => {
		expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
	});

	it("rejects impossible calendar dates", () => {
		expect(isDateOnly("2026-02-31")).toBe(false);
		expect(isDateOnly("2026-02-28")).toBe(true);
		expect(isDateOnly("2026-2-28")).toBe(false);
		expect(() => addDays("2026-02-31", 1)).toThrow(RangeError);
	});

	it("falls back to Asia/Kolkata for invalid timezones", () => {
		const date = new Date("2026-10-30T00:00:00.000Z");

		expect(dateInTimeZone(date, "Not/A_Timezone")).toBe(
			dateInTimeZone(date, DEFAULT_TIME_ZONE),
		);
	});
});
