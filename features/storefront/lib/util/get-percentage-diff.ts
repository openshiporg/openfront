/**
 * Calculates the percentage difference between two numbers
 * @param original - Original value
 * @param calculated - Calculated value
 * @returns Percentage difference as a string
 */
export const getPercentageDiff = (original: number, calculated: number): string => {
  const diff = original - calculated
  const decrease = (diff / original) * 100

  return decrease.toFixed();
}