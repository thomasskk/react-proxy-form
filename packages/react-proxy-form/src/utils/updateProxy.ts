import {
  deleteSymbol,
  ProxyCode,
  resetSymbol,
  setSymbol,
  updateAllSymbol,
  updateSymbol,
} from './proxySymbol'

export const updateProxy = () =>
  new Proxy(
    {
      s: new Map<string | symbol, () => void>(),
    },
    {
      set: (
        target: Record<string | symbol, any>,
        property,
        value: ProxyCode
      ) => {
        switch (value.code) {
          case setSymbol:
            target.s.set(property, value.cb)
            break
          case updateSymbol:
            target.s.get(property)?.()
            break
          case deleteSymbol:
            if (property !== undefined) {
              target.s.delete(property)
            }
            break
          case updateAllSymbol:
            for (const [, v] of target.s) {
              v()
            }
            break
          case resetSymbol:
            target.s = new Map()
            break
          default:
            target[property] = value
            return true
        }

        return true
      },
    }
  )
