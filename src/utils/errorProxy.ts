import {
  deleteSymbol,
  ProxyCode,
  refreshSymbol,
  resetAndUpdateSymbol,
  resetSymbol,
  setSymbol,
  updateSymbol,
} from './proxySymbol.js'

export const iM = Symbol('iM')
export const mM = Symbol('mM')

export const errorProxy = () => {
  return new Proxy(
    {
      iM: new Map<string | symbol, () => void>(),
      mM: new Map<string | symbol, string[]>(),
      gM: new Map<string | symbol, string[]>(),
    },
    {
      set: (target: any, property, value: ProxyCode) => {
        switch (value.code) {
          case setSymbol:
            target.iM.set(property, value.cb)
            break
          case updateSymbol:
            const UPDATE_cb = target.iM.get(property)
            if (!UPDATE_cb) {
              break
            }
            target.mM.set(property, value.value)
            UPDATE_cb()
            break
          case refreshSymbol:
            target.mM.delete(property)
            const REFRESH_cb = target.iM.get(property)
            REFRESH_cb?.()
            break
          case resetSymbol:
            target.mM = new Map()
            break
          case deleteSymbol:
            target.mM.delete(property)
            target.iM.delete(property)
            break
          case resetAndUpdateSymbol:
            target.mM = new Map()
            for (const [, v] of target.iM) {
              v()
            }
            break
          default:
            target[property] = value
            return true
        }

        return true
      },
      get: (target, property) => {
        if (property === iM) {
          return target.iM
        }
        if (property === mM) {
          return target.mM
        }
        return target.mM.get(property)
      },
    }
  ) as any
}
