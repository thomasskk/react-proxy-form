import {
  deleteSymbol,
  refreshSymbol,
  resetAndUpdateSymbol,
  resetSymbol,
  setGlobalSymbol,
  setSymbol,
  updateGlbobalSymbol,
  updateSymbol,
} from './proxySymbol'
import type { ProxyCode } from './proxySymbol'

export const i = Symbol('i')
export const m = Symbol('m')
export const g = Symbol('g')

export const errorProxy = () => {
  return new Proxy(
    {
      i: new Map<string | symbol, () => void>(), // atomic error
      m: new Map<string | symbol, string[]>(), // messages store
      g: new Map<string | symbol, () => void>(), // global error
    },
    {
      set: (target, property, value: ProxyCode) => {
        switch (value.code) {
          case setGlobalSymbol:
            target.g.set(property, value.cb)
            break
          case setSymbol:
            target.i.set(property, value.cb)
            break
          case updateGlbobalSymbol:
            for (const [, v] of target.g) {
              v()
            }
            break
          case updateSymbol:
            target.m.set(property, value.value)
            target.i.get(property)?.()
            break
          case refreshSymbol:
            target.m.delete(property)
            target.i.get(property)?.()
            break
          case resetSymbol:
            target.m = new Map()
            break
          case deleteSymbol:
            target.m.delete(property)
            target.i.delete(property)
            break
          case resetAndUpdateSymbol:
            target.m = new Map()
            for (const [, v] of target.i) {
              v()
            }
            break
          default:
            target[property as keyof typeof target] = value
            return true
        }

        return true
      },
      get: (target, property) => {
        return property === i
          ? target.i
          : property === m
          ? target.m
          : property === m
          ? target.g
          : target.m.get(property)
      },
    }
  ) as Record<string, any>
}
