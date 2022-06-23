import * as z from 'myzod'

export const resolver =
  <T>(schema: T) =>
  (path: string, value: any) => {
    const errors = new Map()

    try {
      path.split('.').reduce((acc: any, cv, i, arr) => {
        if (cv.charAt(0) === '[' && cv.charAt(cv.length - 1) === ']') {
          if (arr[i + 1]) {
            return acc?.schema
          } else {
            acc.schema.parse(value)
          }
        }
        if (arr[i + 1]) {
          return acc.objectShape[cv]
        } else {
          acc.objectShape[cv].parse(value)
        }
      }, schema)
    } catch (err: unknown) {
      if (err instanceof z.ValidationError) {
        errors.set(path, err.message)
      }
    }

    return { errors } as {
      errors: Map<string, string>
      type: z.Infer<T>
    }
  }