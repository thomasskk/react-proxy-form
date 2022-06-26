import { useEffect, useReducer } from 'react'
import { deleteSymbol, setGlobalSymbol, setSymbol } from './proxySymbol'

export const errorsWatcher = (prox: Record<string, any>, name = '') => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]

  useEffect(() => {
    prox[name] = { code: name ? setSymbol : setGlobalSymbol, cb: forceUpdate }
    return () => {
      if (name) {
        prox[name] = { code: deleteSymbol }
      }
    }
  }, [])

  return name ? prox[name] : prox
}
