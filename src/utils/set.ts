import { dotPathReader } from './dotPathReader.js'
import { isObject } from './isHelper.js'
import { isProxy } from './proxySymbol.js'

export const set = (
  object: object,
  path: string,
  value?: unknown,
  offset = 1
) => {
  const arrPath = dotPathReader(path)
  const length = arrPath.length

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index === length - offset:
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
