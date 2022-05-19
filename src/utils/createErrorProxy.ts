export type ErrorProxyCode =
  | { code: 'INIT'; cb: () => void }
  | { code: 'UPDATE'; value: string }
  | { code: 'RESET_AND_UPDATE' }
  | { code: 'REFRESH' }
  | { code: 'RESET' }
  | { code: 'DELETE' }

export const createErrorProxy = () => {
  return new Proxy(
    {
      initStore: new Map<string | symbol, () => void>(),
      mssgStore: new Map<string | symbol, string>(),
    },
    {
      set: (target, property, value: ErrorProxyCode, receiver) => {
        switch (value.code) {
          case 'INIT':
            target.initStore.set(property, value.cb)
            Reflect.set(target, 'initStore', target.initStore, receiver)
            break
          case 'UPDATE':
            const udpateValue = target.initStore.get(property)
            if (!udpateValue) {
              break
            }
            target.mssgStore.set(property, value.value)
            Reflect.set(target, 'mssgStore', target.mssgStore, receiver)
            udpateValue()
            break
          case 'REFRESH':
            target.mssgStore.delete(property)
            target.initStore.get(property)?.()
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
      get: (target, property: string) => {
        return target.mssgStore.get(property)
      },
    }
  ) as any
}
