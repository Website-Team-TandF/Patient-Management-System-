export const getISTTodayBoundaries = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [{ value: year }, , { value: month }, , { value: day }] =
    formatter.formatToParts(now);

  const startIST = new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  const endIST = new Date(`${year}-${month}-${day}T23:59:59.999+05:30`);

  return {
    start: startIST,
    end: endIST,
  };
};