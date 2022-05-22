import { useEffect, useReducer } from 'react'
import { ErrorProxyCode } from './createErrorProxy'

export const error = (prox: Record<string, any>, name: string) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  useEffect(() => {
    prox[name] = { code: 'SET', cb: forceUpdate } as ErrorProxyCode
    return () => {
      prox[name] = { code: 'DELETE' }
    }
  }, [])
  return prox[name]
}
