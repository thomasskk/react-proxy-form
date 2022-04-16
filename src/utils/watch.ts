import { useEffect, useReducer, useRef, useState } from 'react'
import createValueProxy, { proxyKeys } from './createValueProxy'
import dotPathReader from './dotPathReader'
import get from './get'
import { isObject } from './isHelper'

const watch = (object: Record<string, any>, path: string, updateStore: any) => {
  const [depUpdate, forceDepUpdate] = useState(0)
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const value = useRef()
  const key = useRef<string | number>('')

  useEffect(() => {
    const arrPath = dotPathReader(path)
    const length = arrPath.length
    key.current = arrPath[length - 1]

    if (arrPath.length === 1) {
      const keys = object.value?.[proxyKeys]
      let tmpKeys = [key.current]
      if (keys) {
        tmpKeys = [...keys, tmpKeys[0]]
      }
      object.value = createValueProxy(
        isObject(object.value) ? { ...object.value } : object.value,
        forceUpdate,
        tmpKeys
      )
      value.current = object.value
    } else {
      arrPath.reduce((acc, cv, index) => {
        if (index === length - 2) {
          const keys = object.value?.[proxyKeys]
          let tmpKeys = [key.current]
          if (keys) {
            tmpKeys = [...keys, tmpKeys[0]]
          }
          acc[cv] = createValueProxy(
            isObject(acc[cv]) ? { ...acc[cv] } : acc[cv],
            forceUpdate,
            tmpKeys
          )
          value.current = acc[cv]
        }
        return acc[cv]
      }, object.value)
    }
    updateStore[path] = {
      code: 'SET',
      update: () => forceDepUpdate((v) => v + 1),
    }
    forceUpdate()
    return () => {
      updateStore[path] = { code: 'DELETE' }
    }
  }, [depUpdate])

  return get(object.value, path)
}

export default watch
