export const getPercentageDiff = (original, calculated) => {
  const diff = original - calculated
  const decrease = (diff / original) * 100

  return decrease.toFixed();
}
