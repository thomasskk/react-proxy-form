import { isProxy, noUpdateProxy, proxyKeys } from './proxySymbol'

// trigger cb on set when property is in keys and its value is changed
export const valueProxy = <
  T extends Record<string | symbol, unknown> | unknown[],
  K extends (string | symbol)[]
>(
  proxyValue: T,
  cb: () => void,
  keys: K
) => {
  return new Proxy(proxyValue, {
    set: (target: any, property, value) => {
      if (value?.code === noUpdateProxy) {
        target[property] = value.value
        return true
      }

      // if key is not in keys => normal behavior
      if (!keys.includes(property)) {
        target[property] = value
        return true
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

      return target[p]
    },
  })
}
