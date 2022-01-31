import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import createValueProxy from './createValueProxy'
import dotPathReader from './dotPathReader'
import { isObject } from './isHelper'
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect


const watch = (object: Record<string, any>, path: string, updateStore: any) => {
  const [depUpdate, forceDepUpdate] = useState(0)
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const value = useRef()
  const key = useRef<string | number>('')

  useIsomorphicLayoutEffect(() => {
    const arrPath = dotPathReader(path)
    const length = arrPath.length
    key.current = arrPath[length - 1]
    if (arrPath.length === 1) {
      object.value = createValueProxy(
        isObject(object.value) ? { ...object.value } : object.value,
        forceUpdate,
        key.current
      )
      value.current = object.value
    } else {
      arrPath.reduce((acc, cv, index) => {
        if (index === length - 2) {
          acc[cv] = createValueProxy(
            isObject(acc[cv]) ? { ...acc[cv] } : acc[cv],
            forceUpdate,
            key.current
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

  return value.current?.[key.current]
}

export default watch
