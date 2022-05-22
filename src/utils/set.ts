import { isProxy } from './valueProxy'
import { dotPathReader } from './dotPathReader'
import { isObject } from './isHelper'

export const set = (
  object: Record<string, any>,
  path: string,
  value?: unknown,
  offset: number = 1
) => {
  const arrPath = dotPathReader(path)
  const length = arrPath.length

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index == length - offset:
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
      case typeof arrPath[index + 1] == 'number':
        acc[cv] = []
        break
      default:
        acc[cv] = {}
    }

    return acc[cv]
  }, object)
}
