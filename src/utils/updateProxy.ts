import {
  deleteSymbol,
  ProxyCode,
  resetSymbol,
  setSymbol,
  updateAllSymbol,
  updateSymbol,
} from './proxySymbol.js'

export const updateProxy = () =>
  new Proxy(
    {
      s: new Map<string | symbol, () => void>(),
    },
    {
      set: (target, property, value: ProxyCode, receiver) => {
        switch (value.code) {
          case setSymbol:
            target.s.set(property, value.cb)
            Reflect.set(target, 's', target.s, receiver)
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
            Reflect.set(target, 's', new Map(), receiver)
            break
          default:
            return Reflect.set(target, property, value, receiver)
        }

        return true
      },
    }
  ) as any
