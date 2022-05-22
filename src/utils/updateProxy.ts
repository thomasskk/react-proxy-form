export type UpdateProxyCode =
  | { code: 'SET'; update: () => void }
  | { code: 'DELETE' }
  | { code: 'UPDATE_ALL' }
  | { code: 'RESET' }
  | { code: 'UPDATE' }

export const updateProxy = () =>
  new Proxy(
    {
      store: new Map<string | symbol, () => void>(),
    },
    {
      set: (target, property, value: UpdateProxyCode, receiver) => {
        switch (value.code) {
          case 'SET':
            target.store.set(property, value.update)
            Reflect.set(target, 'store', target.store, receiver)
            break
          case 'UPDATE':
            target.store.get(property)?.()
            break
          case 'DELETE':
            if (property !== undefined) {
              target.store.delete(property)
            }
            break
          case 'UPDATE_ALL':
            for (const [, v] of target.store) {
              v()
            }
            break
          case 'RESET':
            Reflect.set(target, 'store', new Map(), receiver)
            break
          default:
            return Reflect.set(target, property, value, receiver)
        }

        return true
      },
    }
  ) as any
