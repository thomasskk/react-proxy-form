export const setSymbol = Symbol('set')
export const updateSymbol = Symbol('upd')
export const resetAndUpdateSymbol = Symbol('rau')
export const refreshSymbol = Symbol('rfs')
export const resetSymbol = Symbol('rst')
export const deleteSymbol = Symbol('dlt')
export const updateAllSymbol = Symbol('upa')

export type ProxyCode =
  | { code: typeof setSymbol; cb: () => void }
  | { code: typeof deleteSymbol }
  | { code: typeof resetSymbol }
  | { code: typeof updateSymbol; value: any }
  | { code: typeof updateAllSymbol }
  | { code: typeof refreshSymbol }
  | { code: typeof resetAndUpdateSymbol }

export const isProxy = Symbol('_PROXY_')
export const proxyKeys = Symbol('_KEYS_')
