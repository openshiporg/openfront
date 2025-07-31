/**
 * Creates an array of numbers from 0 to times-1
 * @param times - Number of elements to create
 * @returns Array of numbers
 */
const repeat = (times: number): number[] => {
  return Array.from(Array(times).keys());
}

export default repeat