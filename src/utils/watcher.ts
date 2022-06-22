import { useEffect, useReducer, useRef } from 'react'
import { valueProxy } from './valueProxy'
import { dotPathReader } from './dotPathReader'
import { get } from './get'
import { isObject } from './isHelper'
import { deleteSymbol, proxyKeys } from '../utils/proxySymbol'
import type { ProxyCode as PC } from './proxySymbol'
import { setSymbol } from './proxySymbol'

export const watcher = (
  object: object,
  path: string,
  updateStore: object,
  watchStore: Set<string>,
  defaultValue?: object
) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const key = useRef<string | symbol | number>('d')
  const value = useRef<object>({ d: defaultValue ?? get(object, path) })

  useEffect(() => {
    const setProxyFn = () => {
      const arrPath = dotPathReader(path)
      key.current = arrPath[arrPath.length - 1]
      arrPath.reduce((acc, cv, index) => {
        if (index === arrPath.length - 2 || arrPath.length === 1) {
          // keys array to determine which property is watched
          const keys = object[proxyKeys] || []
          keys.push(key.current)

          acc[cv] = valueProxy(
            isObject(acc[cv]) ? { ...acc[cv] } : acc[cv],
            forceUpdate,
            keys
          )

          value.current = acc[cv]
        }
        return acc[cv]
      }, object)
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
  }, [])

  return value.current?.[key.current]
}
