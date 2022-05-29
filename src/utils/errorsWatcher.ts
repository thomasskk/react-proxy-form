import { useEffect, useReducer } from 'react'
import { deleteSymbol, setSymbol } from './proxySymbol.js'

export const errorsWatcher = (prox: Record<string, any>, name: string) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  useEffect(() => {
    prox = { code: setSymbol, cb: forceUpdate }
    return () => {
      prox[name] = { code: deleteSymbol }
    }
  }, [])
  return prox
}
