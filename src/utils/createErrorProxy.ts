export type ErrorProxyCode =
  | { code: 'INIT'; update: () => void }
  | { code: 'UPDATE'; value: string }
  | { code: 'RESET_AND_UPDATE' }
  | { code: 'REFRESH' }
  | { code: 'RESET' }

type Store = {
  initStore: Map<string, () => void>
  mssgStore: Map<string, string>
}

const createErrorProxy = () =>
  new Proxy<Partial<ErrorProxyCode> & Store>(
    {
      initStore: new Map<string, () => void>(),
      mssgStore: new Map<string, string>(),
    },
    {
      set: (t, p: string, v: ErrorProxyCode, r) => {
        if (v.code === 'INIT') {
          t.initStore.set(p, v.update)
          Reflect.set(t, 'initStore', t.initStore, r)
          return true
        }
        if (v.code === 'UPDATE') {
          const udpateValue = t.initStore.get(p)
          if (!udpateValue) {
            return true
          }
          t.mssgStore.set(p, v.value)
          Reflect.set(t, 'mssgStore', t.mssgStore, r)
          udpateValue()
          return true
        }
        if (v.code === 'REFRESH') {
          t.mssgStore.delete(p)
          t.initStore.get(p)?.()
          return true
        }
        if (v.code === 'RESET_AND_UPDATE') {
          Reflect.set(t, 'mssgStore', new Map(), r)
          for (const [, v] of t.initStore) {
            v()
          }
          return true
        }
        return true
      },
      get: (t, p: string) => {
        return t.mssgStore.get(p)
      },
    }
  )

export default createErrorProxy
