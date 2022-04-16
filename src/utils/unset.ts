import { isProxy } from './createValueProxy'
import dotPathReader from './dotPathReader'
import { isObject, isObjWritable } from './isHelper'

const unset = (object: Record<string, any>, path?: string) => {
  if (path === undefined || object === undefined) {
    return
  }

  const arrPath = dotPathReader(path)
  const length = arrPath.length

  if (length === 1) {
    delete object[path]
    return
  }

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index === length - 1:
        if (acc !== undefined) {
          delete acc[cv]
        }
        break
      case index === length - 2:
        if (isObject(acc[cv]) && !acc?.[cv]?.[isProxy]) {
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
        if (!isObjWritable(acc, cv) && !acc[cv]?.[isProxy]) {
          acc[cv] = { ...acc[cv] }
        }
        break
    }
    return acc?.[cv]
  }, object)
}

export default unset
