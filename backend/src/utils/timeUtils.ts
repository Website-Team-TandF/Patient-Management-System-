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
  const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  const startOfISTDay = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  startOfISTDay.setUTCHours(0, 0, 0, 0);
  // Convert back to UTC to get the actual UTC moment that corresponds to 00:00 IST
  const startInUTC = new Date(startOfISTDay.getTime() - (5.5 * 60 * 60 * 1000));

  const endOfISTDay = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  endOfISTDay.setUTCHours(23, 59, 59, 999);
  // Convert back to UTC to get the actual UTC moment that corresponds to 23:59 IST
  const endInUTC = new Date(endOfISTDay.getTime() - (5.5 * 60 * 60 * 1000));

  return {
    start: startInUTC,
    end: endInUTC,
    todayIST: istNow
  };
};

/**
 * Returns the start of today in IST as a UTC date object
 * for comparison with database dates (which are stored in UTC)
 */
export const getISTTodayStart = () => {
  return getISTTodayBoundaries().start;
};
