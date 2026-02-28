import { differenceInYears, parseISO, isValid } from 'date-fns';

/**
 * Calculates age based on a date of birth string.
 * @param dob - Date of birth in ISO format or YYYY-MM-DD
 * @returns Age as a number or null if invalid
 */
export const calculateAge = (dob: string | Date | undefined): number | null => {
  if (!dob) return null;
  
  const birthDate = typeof dob === 'string' ? parseISO(dob) : dob;
  
  if (!isValid(birthDate)) return null;
  
  return differenceInYears(new Date(), birthDate);
};
