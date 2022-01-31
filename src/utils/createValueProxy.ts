export const isProxy = Symbol('isProxy')

const createValueProxy = (v: any, setCb: () => void, key: string | number) =>
  new Proxy(v, {
    deleteProperty: (target, p) => {
      Reflect.deleteProperty(target, p)
      return true
    },
    set: (target, p, value, receiver) => {
      if (p !== key) {
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

      p === key && setCb?.()
      return true
    },
    get: (target, p, receiver) => {
      if (p === isProxy) {
        return true
      }

      return Reflect.get(target, p, receiver)
    },
  })

export default createValueProxy
