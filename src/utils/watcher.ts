import { useEffect, useReducer, useRef } from 'react'
import type { ObjType } from '../types/index.js'
import { Path, PropertyType } from '../types/utils.js'
import { valueProxy } from './valueProxy.js'
import { dotPathReader } from './dotPathReader.js'
import { get } from './get.js'
import { isObject } from './isHelper.js'
import {
  deleteSymbol,
  ProxyCode as PC,
  proxyKeys,
} from '../utils/proxySymbol.js'
import { setSymbol } from './proxySymbol.js'

export const watcher = <P extends Path<O>, O extends ObjType>(args: {
  object: O
  path: P
  updateStore: any
  watchStore: Set<string>
  defaultValue?: any
}) => {
  const { object, path, updateStore, watchStore, defaultValue } = args

  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const key = useRef<any>('default')
  const value = useRef<any>({ default: defaultValue ?? get(object, path) })

  useEffect(() => {
    const setProxyFn = () => {
      const arrPath = dotPathReader(path)
      key.current = arrPath[arrPath.length - 1]
      arrPath.reduce((acc: any, cv, index) => {
        if (index === arrPath.length - 2 || arrPath.length === 1) {
          // keys array to determine which property is watched
          const keys = (object[proxyKeys] as any[]) || []
          keys.push(key.current)

          acc[cv] = valueProxy({
            keys,
            value: isObject(acc[cv]) ? { ...acc[cv] } : acc[cv],
            cb: forceUpdate,
          })

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

  return value.current?.[key.current] as PropertyType<O, P>
}
