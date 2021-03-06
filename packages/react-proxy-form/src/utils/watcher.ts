import { useEffect, useReducer, useRef } from 'react'
import { deleteSymbol, proxyKeys } from '../utils/proxySymbol'
import { dotPathReader } from './dotPathReader'
import { get } from './get'
import { isObject } from './isHelper'
import type { ProxyCode as PC } from './proxySymbol'
import { setSymbol } from './proxySymbol'
import { valueProxy } from './valueProxy'

export const watcher = (
  object: {
    v: Record<string | symbol, any>
  },
  path: string,
  updateStore: Record<string | symbol, any>,
  watchStore: Set<string>,
  resetRef: number,
  defaultValue?: Record<string | symbol, any>
) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const key = useRef<string | symbol | number>('d')
  const value = useRef<Record<string | symbol, any> | undefined>({
    d: defaultValue ?? get(object.v, path),
  })

  useEffect(() => {
    const setProxyFn = () => {
      const arrPath = dotPathReader(path)
      key.current = arrPath[arrPath.length - 1]

      arrPath.reduce((acc, cv, index) => {
        if (arrPath.length === 1) {
          // keys array to determine which property is watched
          const keys = acc[proxyKeys] || []
          keys.push(key.current)

          object.v = valueProxy({ ...object.v }, forceUpdate, keys)

          value.current = object.v
        }
        if (index === arrPath.length - 2) {
          const keys = acc[cv]?.[proxyKeys] || []
          keys.push(key.current)

          acc[cv] = valueProxy(
            isObject(acc[cv]) ? { ...acc[cv] } : [...acc[cv]],
            forceUpdate,
            keys
          )

          value.current = acc[cv]
        }
        return acc[cv]
      }, object.v)
    }

    if (value.current?.[key.current] === undefined) {
      watchStore.add(path)
      updateStore[path] = <PC>{
        code: setSymbol,
        cb: () => {
          setProxyFn()
          updateStore[path] = <PC>{
            code: setSymbol,
            cb: () => forceUpdate,
          }
          watchStore.delete(path)
          forceUpdate()
        },
      }
      value.current = undefined
    } else {
      updateStore[path] = <PC>{
        code: setSymbol,
        cb: () => forceUpdate,
      }
      setProxyFn()
    }
    return () => {
      watchStore.delete(path)
      updateStore[path] = <PC>{ code: deleteSymbol }
    }
  }, [resetRef])

  return value.current?.[key.current]
}
