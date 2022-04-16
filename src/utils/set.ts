import { isProxy } from './createValueProxy'
import dotPathReader from './dotPathReader'
import { isObject } from './isHelper'

const set = (object: Record<string, any>, path: string, value?: unknown) => {
  const arrPath = dotPathReader(path)
  const length = arrPath.length

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index === length - 1:
        if (value !== undefined) {
          acc[cv] = value
        } else {
          delete acc[cv]
        }
        break
      case acc[cv]?.[isProxy]:
        break
      case isObject(acc[cv]):
        acc[cv] = { ...acc[cv] }
        break
      case Array.isArray(acc[cv]):
        acc[cv] = [...acc[cv]]
        break
      case typeof arrPath[index + 1] === 'number':
        acc[cv] = []
        break
      default:
        acc[cv] = {}
    }

    return acc[cv]
  }, object)
}

export default set
