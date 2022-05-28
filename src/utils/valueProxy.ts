import type { ObjType, ArrayType } from '../types/index.js'
import { isProxy, proxyKeys } from './proxySymbol.js'

// trigger cb on set when property is in keys and its value is changed
export const valueProxy = <
  T extends ObjType | ArrayType,
  K extends (string | symbol)[]
>(args: {
  value: T
  cb: () => void
  keys: K
}) => {
  const { value: proxyValue, cb, keys } = args
  return new Proxy(proxyValue, {
    set: (target, property, value, receiver) => {
      // if key is not in keys => normal behavior

      if (!keys.includes(property)) {
        return Reflect.set(target, property, value, receiver)
      }

      // if the previous value is undefined and the new one too => delete
      const prevValue = Reflect.get(target, property, receiver)
      if (value === undefined && prevValue === undefined) {
        if (Array.isArray(target)) {
          target.splice(Number(property), 1)
        } else {
          Reflect.deleteProperty(target, property)
        }
        return true
      }

      // !!
      // edge case ?
      // !!
      if (Object.is(prevValue, value)) {
        return true
      }

      Reflect.set(target, property, value, receiver)
      cb()
      return true
    },
    get: (target, p, receiver) => {
      if (p === isProxy) {
        return true
      }
      if (p === proxyKeys) {
        return keys
      }

      return Reflect.get(target, p, receiver)
    },
  })
}
