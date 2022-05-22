import { useEffect, useReducer, useRef } from 'react'
import { ObjType } from '../types'
import { Path, PropertyType } from '../types/utils'
import { UpdateProxyCode as UPC } from './updateProxy'
import { valueProxy, proxyKeys } from './valueProxy'
import { dotPathReader } from './dotPathReader'
import { get } from './get'
import { isObject } from './isHelper'

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
        if (index == arrPath.length - 2 || arrPath.length == 1) {
          // keys array to determine which property is watched
          const keys = (object[proxyKeys as any] as any[]) || []
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
      updateStore[path] = <UPC>{
        code: 'SET',
        update: () => {
          setProxyFn()
          updateStore[path] = <UPC>{
            code: 'SET',
            update: () => forceUpdate,
          }
          watchStore.delete(path)
          forceUpdate()
        },
      }
      value.current = undefined
    } else {
      updateStore[path] = <UPC>{
        code: 'SET',
        update: () => forceUpdate,
      }
      setProxyFn()
    }
    return () => {
      watchStore.delete(path)
      updateStore[path] = <UPC>{ code: 'DELETE' }
    }
  }, [])

  return value.current?.[key.current] as PropertyType<O, P>
}
