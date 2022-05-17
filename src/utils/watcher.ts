import { useEffect, useReducer, useRef, useState } from 'react'
import { ArrayType, ObjType } from '../types'
import { createValueProxy, proxyKeys } from './createValueProxy'
import { dotPathReader } from './dotPathReader'
import { isObject } from './isHelper'

export const watcher = (args: {
  object: ArrayType | ObjType
  path: string
  updateStore: any
}) => {
  const { object, path, updateStore } = args

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
        // check if the value is already a proxy
        const keys = object[proxyKeys as any] as any[]
        // if so push the selected key to the keys array
        if (keys) {
          keys.push(key.current)
        }
        // and then recreate the proxy with the refreshed keys
        acc[cv] = createValueProxy({
          keys,
          value: isObject(acc) ? { ...acc } : acc,
          cb: forceUpdate,
        })
        value.current = acc[cv]
      }
      return acc[cv]
    }, object)

    updateStore[path] = {
      code: 'SET',
      update: () => forceDepUpdate((v) => v + 1),
    }

    forceUpdate()

    return () => {
      updateStore[path] = { code: 'DELETE' }
    }
  }, [depUpdate])

  return key.current ? object[key.current as any] : undefined
}
