export type ErrorProxyCode =
  | { code: 'SET'; update: () => void }
  | { code: 'DELETE' }
  | { code: 'UPDATE_ALL' }
  | { code: 'RESET' }

type Store = { store: Map<string, () => void> }

const createUpdateProxy = () =>
  new Proxy<Store>(
    {
      store: new Map<string, () => void>(),
    },
    {
      set: (t, p: string, v: ErrorProxyCode, r) => {
        if (v.code === 'SET') {
          t.store.set(p, v.update)
          Reflect.set(t, 'store', t.store, r)
          return true
        }
        if (v.code === 'DELETE') {
          if (p !== undefined) {
            t.store.delete(p)
          }
          return true
        }
        if (v.code === 'UPDATE_ALL') {
          for (const [, v] of t.store) {
            v()
          }
          return true
        }
        if (v.code === 'RESET') {
          Reflect.set(t, 'store', new Map(), r)
          return true
        }

        return true
      },
    }
  )

export default createUpdateProxy
