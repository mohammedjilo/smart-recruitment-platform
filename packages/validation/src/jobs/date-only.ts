const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateOnly = (value: string): boolean => {
  if (!DATE_ONLY_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const toDateOnlyKey = (value: Date | string): string | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString().slice(0, 10);
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    return isValidDateOnly(value) ? value : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

export const currentDateOnlyKey = (now: Date = new Date()): string =>
  now.toISOString().slice(0, 10);

export const isDateOnOrAfterToday = (
  value: Date | string,
  now: Date = new Date()
): boolean => {
  const dateKey = toDateOnlyKey(value);
  return dateKey !== null && dateKey >= currentDateOnlyKey(now);
};

export const dateOnlyToUtcDate = (value: string): Date | null => {
  if (!isValidDateOnly(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
};
