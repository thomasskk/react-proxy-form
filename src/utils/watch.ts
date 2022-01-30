import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import createValueProxy from './createValueProxy'
import dotPathReader from './dotPathReader'
import get from './get'
import { isObject } from './isHelper'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const watch = (object: Record<string, any>, path: string) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const value = useRef(get(object, path))
  const key = useRef<string | number>(path.split('.').pop()!)

  useIsomorphicLayoutEffect(() => {
    const arrPath = dotPathReader(path)
    const length = arrPath.length
    key.current = arrPath[length - 1]
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
    }, object)
  }, [])

  return value.current[key.current]
}

export default watch
