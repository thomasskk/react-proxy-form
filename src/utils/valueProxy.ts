import type { ObjType, ArrayType } from '../types/index.js'
import { isProxy, proxyKeys } from './proxySymbol.js'

// trigger cb on set when property is in keys and its value is changed
export const valueProxy = <
  T extends ObjType | ArrayType,
  K extends (string | symbol)[]
>(
  proxyValue: T,
  cb: () => void,
  keys: K
) => {
  return new Proxy(proxyValue, {
    set: (target, property: any, value) => {
      // if key is not in keys => normal behavior

      if (!keys.includes(property)) {
        return (target[property] = value)
      }

      // if the previous value is undefined and the new one too => delete
      const prevValue = target[property]

      if (value === undefined && prevValue === undefined) {
        if (Array.isArray(target)) {
          target.splice(Number(property), 1)
        } else {
          delete target[property]
        }
        return true
      }

      if (Object.is(prevValue, value)) {
        return true
      }

      target[property] = value
      cb()
      return true
    },
    get: (target, p) => {
      if (p === isProxy) {
        return true
      }
      if (p === proxyKeys) {
        return keys
      }

      return target[p as any]
    },
  })
}
