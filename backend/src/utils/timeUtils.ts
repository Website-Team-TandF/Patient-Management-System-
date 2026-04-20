/**
 * Utility functions for time and date manipulations
 */

/**
 * Returns the start and end of today in Indian Standard Time (IST)
 * IST is UTC+5.5
 */
export const getISTTodayBoundaries = () => {
  // Current UTC time
  const now = new Date();

  // Create IST date object by adding 5.5 hours to UTC
  // Note: This is a way to represent the local IST "view" as a Date object for calculations
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

  const startOfISTDay = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  startOfISTDay.setUTCHours(0, 0, 0, 0);
  // Convert back to UTC to get the actual UTC moment that corresponds to 00:00 IST
  const startInUTC = new Date(startOfISTDay.getTime() - 5.5 * 60 * 60 * 1000);

  const endOfISTDay = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  endOfISTDay.setUTCHours(23, 59, 59, 999);
  // Convert back to UTC to get the actual UTC moment that corresponds to 23:59 IST
  const endInUTC = new Date(endOfISTDay.getTime() - 5.5 * 60 * 60 * 1000);

  return {
    start: startInUTC,
    end: endInUTC,
    todayIST: istNow,
  };
};

/**
 * Returns the start of today in IST as a UTC date object
 * for comparison with database dates (which are stored in UTC)
 */
export const getISTTodayStart = () => {
  return getISTTodayBoundaries().start;
};

/**
 * Parses a date string in YYYY-MM-DD format or ISO format as a local date
 * This ensures consistent date parsing regardless of timezone
 */
export const parseLocalDateString = (dateString: string): Date => {
  if (!dateString) {
    throw new Error("Date string is required");
  }

  // Handle YYYY-MM-DD format (local date)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    if (
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw new Error(`Invalid date components: ${dateString}`);
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  // Handle ISO format (with timezone) - extract date part only
  if (dateString.includes("T") || dateString.includes(" ")) {
    const datePart = dateString.split(/[T ]/)[0];
    return parseLocalDateString(datePart);
  }

  // Fallback to standard Date parsing for other formats
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  // Reset time to midnight to ensure date-only comparison
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

/**
 * Formats a Date object to YYYY-MM-DD string (local date)
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
