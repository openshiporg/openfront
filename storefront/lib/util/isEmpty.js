export const isObject = (input) => input instanceof Object
export const isArray = (input) => Array.isArray(input)
export const isEmpty = (input) => {
  return input === null ||
  input === undefined ||
  (isObject(input) && Object.keys(input).length === 0) ||
  (isArray(input) && (input).length === 0) ||
  (typeof input === "string" && input.trim().length === 0);
}
