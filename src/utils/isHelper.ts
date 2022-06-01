export const isEmptyObject = (obj: object) => {
  let isEmpty = true
  for (const _ in obj) {
    isEmpty = false
    break
  }
  return isEmpty
}

export const isObjWritable = (obj: object, key: string | number) => {
  return !!Object.getOwnPropertyDescriptor(obj, key)?.writable
}

export const isObject = <T extends object>(value: unknown): value is T => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null
}

export const isNumber = (value: unknown): value is number => {
  return !isNaN(parseFloat(String(value))) && isFinite(Number(value))
}
