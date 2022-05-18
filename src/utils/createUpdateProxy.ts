export type UpdateProxyCode =
  | { code: 'SET'; update: () => void }
  | { code: 'DELETE' }
  | { code: 'UPDATE_ALL' }
  | { code: 'RESET' }

export const createUpdateProxy = () =>
  new Proxy(
    {
      store: new Map<string | symbol, () => void>(),
    },
    {
      set: (target, property, value: UpdateProxyCode, receiver) => {
        if (value.code == 'SET') {
          target.store.set(property, value.update)
          Reflect.set(target, 'store', target.store, receiver)
          return true
        }
        if (value.code == 'DELETE') {
          if (property !== undefined) {
            target.store.delete(property)
          }
          return true
        }
        if (value.code == 'UPDATE_ALL') {
          for (const [, v] of target.store) {
            v()
          }
          return true
        }
        if (value.code == 'RESET') {
          Reflect.set(target, 'store', new Map(), receiver)
          return true
        }

        return true
      },
    }
  ) as any
