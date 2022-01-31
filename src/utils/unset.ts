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

  if (length === 2) {
    const p1 = arrPath[0]
    const p2 = arrPath[1]
    if (
      !object[p1]?.[isProxy] &&
      isObject(object[p1]) &&
      Object.keys(object[p1]).length === 1 &&
      object[p1][p2] !== undefined
    ) {
      delete object[p1]
      return
    }
  }

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index === length - 1:
        if (acc !== undefined) {
          delete acc[cv]
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
