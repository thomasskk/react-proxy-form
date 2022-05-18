import { useEffect, useReducer, useRef, useState } from 'react'
import { ArrayType, ObjType } from '../types'
import { UpdateProxyCode } from './createUpdateProxy'
import { createValueProxy, proxyKeys } from './createValueProxy'
import { dotPathReader } from './dotPathReader'
import { isObject } from './isHelper'

export const watcher = (args: {
  object: ArrayType | ObjType
  path: string
  updateStore: any
  watchStore: Set<string>
}) => {
  const { object, path, updateStore, watchStore } = args

  const [depUpdate, forceDepUpdate] = useState(0)
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  // selected key in the object
  const key = useRef<string | symbol | number>()
  // value of the object/array where the selected key is
  const value = useRef<ArrayType | ObjType>()

  useEffect(() => {
    // determine the selected key
    const arrPath = dotPathReader(path)
    key.current = arrPath[arrPath.length - 1]

    arrPath.reduce((acc: any, cv, index) => {
      if (cv === undefined) {
        return
      }
      if (index == arrPath.length - 1) {
        // keys array to determine which property is watched
        const keys = (object[proxyKeys as any] as any[]) || []
        keys.push(key.current)

        acc = createValueProxy({
          keys,
          value: isObject(acc) ? { ...acc } : acc,
          cb: forceUpdate,
        })
        value.current = acc
      }
      return acc[cv]
    }, object)

    updateStore[path] = {
      code: 'SET',
      update: () => forceDepUpdate((v) => v + 1),
    } as UpdateProxyCode

    forceUpdate()

    return () => {
      updateStore[path] = { code: 'DELETE' } as UpdateProxyCode
      watchStore.delete(path)
    }
  }, [depUpdate])

  return key.current !== undefined
    ? value.current?.[key.current as any]
    : undefined
}
