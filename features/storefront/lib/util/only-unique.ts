/**
 * Filter function to return only unique values in an array
 * @param value - Current value
 * @param index - Current index
 * @param self - Array being processed
 * @returns Boolean indicating if this is the first occurrence of the value
 */
export const onlyUnique = <T>(value: T, index: number, self: T[]): boolean =>
  self.indexOf(value) === index