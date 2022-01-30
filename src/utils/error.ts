import { useEffect, useLayoutEffect, useReducer } from 'react'
import { ErrorProxyCode } from './createErrorProxy'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const error = (prox: Record<string, any>, name: string) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  useIsomorphicLayoutEffect(() => {
    prox[name] = { code: 'INIT', update: forceUpdate } as ErrorProxyCode
  }, [])
  return prox[name]
}

export default error
