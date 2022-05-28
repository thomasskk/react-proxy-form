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
      mM: new Map<string | symbol, string>(),
    },
    {
      set: (target, property, value: ProxyCode, receiver) => {
        switch (value.code) {
          case setSymbol:
            target.iM.set(property, value.cb)
            Reflect.set(target, 'iM', target.iM, receiver)
            break
          case updateSymbol:
            const UPDATE_cb = target.iM.get(property)
            if (!UPDATE_cb) {
              break
            }
            target.mM.set(property, value.value)
            Reflect.set(target, 'mM', target.mM, receiver)
            UPDATE_cb()
            break
          case refreshSymbol:
            target.mM.delete(property)
            const REFRESH_cb = target.iM.get(property)
            REFRESH_cb?.()
            break
          case resetSymbol:
            Reflect.set(target, 'mM', new Map(), receiver)
            break
          case deleteSymbol:
            target.mM.delete(property)
            target.iM.delete(property)
            Reflect.set(target, 'mM', target.mM, receiver)
            Reflect.set(target, 'iM', target.iM, receiver)
            break
          case resetAndUpdateSymbol:
            Reflect.set(target, 'mM', new Map(), receiver)
            for (const [, v] of target.iM) {
              v()
            }
            break
          default:
            return Reflect.set(target, property, value, receiver)
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
