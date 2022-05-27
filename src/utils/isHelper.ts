export const isEmptyObject = (obj: any) => {
  let isEmpty = true
  for (const i in obj) {
    isEmpty = false
    break
  }
  return isEmpty
}

export const isObjWritable = (obj: any, key: string | number) => {
  return !!Object.getOwnPropertyDescriptor(obj, key)?.writable
}

export const isObject = <T extends object>(value: unknown): value is T => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null
}

export const isNumber = (value: unknown): value is number => {
  return !isNaN(parseFloat(String(value))) && isFinite(Number(value))
}

export const isStringDate = (value: unknown): value is string => {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  )
}
