import { useEffect, useReducer, useRef, useState } from 'react'
import { createValueProxy, proxyKeys } from './createValueProxy'
import { dotPathReader } from './dotPathReader'
import { isObject } from './isHelper'

export const watcher = (
  object: Record<string, any>,
  path: string,
  updateStore: any
) => {
  const [depUpdate, forceDepUpdate] = useState(0)
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  // selected key in the object
  const key = useRef<string | symbol | number>()
  // value of the object/array where the selected key is
  const value = useRef()

  useEffect(() => {
    // determine the selected key
    const arrPath = dotPathReader(path)
    key.current = arrPath[arrPath.length - 1]

    arrPath.reduce((acc, cv, index) => {
      if (index == arrPath.length - 1) {
        // check if the value is already a proxy
        const keys = object.value?.[proxyKeys]
        // if so push the selected key to the keys array
        if (keys) {
          keys.push(key.current)
        }
        // and then recreate the proxy with the refreshed keys
        acc[cv] = createValueProxy(
          isObject(acc) ? { ...acc } : acc,
          forceUpdate,
          keys
        )
        value.current = acc[cv]
      }
      return acc[cv]
    }, object.value)

    updateStore[path] = {
      code: 'SET',
      update: () => forceDepUpdate((v) => v + 1),
    }

    forceUpdate()

    return () => {
      updateStore[path] = { code: 'DELETE' }
    }
  }, [depUpdate])

  return key.current ? object.value?.[key.current] : undefined
}
