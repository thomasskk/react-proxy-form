import { dotPathReader } from './dotPathReader'
import { isObject } from './isHelper'
import { isProxy } from './proxySymbol'

export const unset = (object: Record<string, any>, path: string) => {
  const arrPath = dotPathReader(path)
  const { length } = arrPath

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index === length - 1:
        if (acc !== undefined) {
          // !!
          // edge case keep undefined ?
          // !!
          if (Array.isArray(acc)) {
            acc.splice(cv as number, 1)
          } else {
            delete acc[cv]
          }
        }
        break
      case index === length - 2:
        // !!
        // edge case keep empty ?
        // !!
        if (isObject(acc[cv]) && !acc[cv][isProxy]) {
          const objKeys = Object.keys(acc[cv])
          if (
            objKeys.length === 0 ||
            (objKeys.length === 1 && objKeys[0] === arrPath[index + 1])
          ) {
            delete acc[cv]
            return
          }
        }
        break
      case isObject(acc[cv]):
        if (
          !Object.getOwnPropertyDescriptor(acc, cv)?.writable &&
          !acc[cv][isProxy]
        ) {
          acc[cv] = { ...acc[cv] }
        }
        break
    }
    return acc?.[cv]
  }, object)
}
