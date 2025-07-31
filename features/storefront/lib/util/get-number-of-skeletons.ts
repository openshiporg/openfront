/**
 * Calculates the number of skeleton loaders to display
 * @param pages - Array of page data
 * @returns Number of skeletons to display
 */
const getNumberOfSkeletons = (pages: any[] | null): number => {
  if (!pages) {
    return 0
  }

  const count = pages[pages.length - 1].response.count
  const retrieved =
    count - pages.reduce((acc: number, curr: any) => acc + curr.response.products.length, 0)

  if (count - retrieved < 12) {
    return count - retrieved
  }

  return 12
};

export default getNumberOfSkeletons