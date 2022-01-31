import { isProxy } from './createValueProxy'
import dotPathReader from './dotPathReader'
import { isObject, isObjWritable } from './isHelper'

const unset = (object: Record<string, any>, path?: string) => {
  if (path === undefined || object === undefined) {
    return
  }

  const arrPath = dotPathReader(path)
  const length = arrPath.length

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
