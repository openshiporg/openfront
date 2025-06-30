/**
 * Checks if the input is an object
 * @param input - The value to check
 * @returns boolean indicating if the input is an object
 */
export const isObject = (input: unknown): boolean => input instanceof Object

/**
 * Checks if the input is an array
 * @param input - The value to check
 * @returns boolean indicating if the input is an array
 */
export const isArray = (input: unknown): boolean => Array.isArray(input)

/**
 * Checks if the input is empty
 * @param input - The value to check
 * @returns boolean indicating if the input is empty
 */
export const isEmpty = (input: unknown): boolean => {
  return input === null ||
  input === undefined ||
  (isObject(input) && Object.keys(input as object).length === 0) ||
  (isArray(input) && (input as any[]).length === 0) ||
  (typeof input === "string" && (input as string).trim().length === 0);
}