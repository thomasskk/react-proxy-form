import type { ObjType } from '../types/index.js'

export const isEmptyObject = (obj: ObjType) => {
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
