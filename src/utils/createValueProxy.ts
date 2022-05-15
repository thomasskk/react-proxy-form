import { ObjType, ArrayType } from '../types'

export const isProxy = Symbol('__PROXY__')
export const proxyKeys = Symbol('__KEYS__')

export const createValueProxy = (
  v: ObjType | ArrayType,
  cb: () => void,
  keys: (string | symbol | number)[]
) => {
  return new Proxy(v, {
    deleteProperty: (target, p) => {
      Reflect.deleteProperty(target, p)
      return true
    },
    set: (target, p, value, receiver) => {
      if (Array.isArray(v)) {
      }
      if (!keys.includes(p)) {
        Reflect.set(target, p, value, receiver)
        return true
      }

      const prevValue = Reflect.get(target, p, receiver)

      if (value === undefined && prevValue === undefined) {
        Reflect.deleteProperty(target, p)
        return true
      }

      if (Object.is(prevValue, value)) {
        return true
      }

      Reflect.set(target, p, value, receiver)

      cb?.()
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
