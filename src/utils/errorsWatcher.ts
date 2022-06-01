import { useEffect, useReducer } from 'react'
import { setGlobalSymbol } from './proxySymbol.js'

export const errorsWatcher = (prox: unknown) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  useEffect(() => {
    prox[''] = { code: setGlobalSymbol, cb: forceUpdate }
  }, [])
  return prox
}
