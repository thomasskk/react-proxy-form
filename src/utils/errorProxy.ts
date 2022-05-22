export type ErrorProxyCode =
  | { code: 'SET'; cb: () => void }
  | { code: 'UPDATE'; value: string }
  | { code: 'RESET_AND_UPDATE' }
  | { code: 'REFRESH' }
  | { code: 'RESET' }
  | { code: 'DELETE' }

export const initStore = Symbol('initStore')
export const mssgStore = Symbol('mssgStore')

export const errorProxy = () => {
  return new Proxy(
    {
      initStore: new Map<string | symbol, () => void>(),
      mssgStore: new Map<string | symbol, string>(),
    },
    {
      set: (target, property, value: ErrorProxyCode, receiver) => {
        switch (value.code) {
          case 'SET':
            target.initStore.set(property, value.cb)
            Reflect.set(target, 'initStore', target.initStore, receiver)
            break
          case 'UPDATE':
            const UPDATE_cb = target.initStore.get(property)
            if (!UPDATE_cb) {
              break
            }
            target.mssgStore.set(property, value.value)
            Reflect.set(target, 'mssgStore', target.mssgStore, receiver)
            UPDATE_cb()
            break
          case 'REFRESH':
            target.mssgStore.delete(property)
            const REFRESH_cb = target.initStore.get(property)
            REFRESH_cb?.()
            break
          case 'RESET':
            Reflect.set(target, 'mssgStore', new Map(), receiver)
            break
          case 'DELETE':
            target.mssgStore.delete(property)
            target.initStore.delete(property)
            Reflect.set(target, 'mssgStore', target.mssgStore, receiver)
            Reflect.set(target, 'initStore', target.initStore, receiver)
            break
          case 'RESET_AND_UPDATE':
            Reflect.set(target, 'mssgStore', new Map(), receiver)
            for (const [, v] of target.initStore) {
              v()
            }
            break
          default:
            return Reflect.set(target, property, value, receiver)
        }

        return true
      },
      get: (target, property) => {
        if (property === initStore) {
          return target.initStore
        }
        if (property === mssgStore) {
          return target.mssgStore
        }
        return target.mssgStore.get(property)
      },
    }
  ) as any
}
