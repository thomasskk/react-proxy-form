export const isProxy = Symbol('__PROXY__')
export const proxyKeys = Symbol('__KEYS__')

const createValueProxy = (v: any, setCb: () => void, keys: any[]) =>
  new Proxy(v, {
    deleteProperty: (target, p) => {
      Reflect.deleteProperty(target, p)
      return true
    },
    set: (target, p, value, receiver) => {
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

      setCb?.()
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

export default createValueProxy
