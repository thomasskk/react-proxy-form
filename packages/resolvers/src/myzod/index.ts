import * as z from 'myzod'

const findPath: any = (
  acc: any,
  cv: string,
  i: number,
  value: any,
  arr: any
) => {
  if (!acc) {
    return
  }
  if (Array.isArray(acc?.schemas)) {
    let err

    for (const schema of acc.schemas) {
      try {
        return findPath(schema, cv, i, value, arr)
      } catch (e) {
        err = e
      }
    }
    throw err
  }

  if (acc?.fn) {
    return acc.fn(value)
  }

  if (arr[i + 1]) {
    if (acc.constructor.name === 'ArrayType') {
      return acc.schema
    }
    if (acc?.objectShape?.[cv]) {
      return acc?.objectShape?.[cv]
    }
    if (acc?.schema?.objectShape?.[cv]) {
      return acc.schema.objectShape[cv]
    }
    if (acc?.objectShape?.schemas) {
      return acc.objectShape
    }
    if (acc?.objectShape?.[z.keySignature]) {
      return acc.objectShape[z.keySignature]
    }
    return acc.objectShape[cv]
  } else {
    if (acc?.objectShape?.[cv]) {
      return acc.objectShape[cv].parse(value)
    }
    if (acc?._parse?.name === 'parseRecord') {
      return acc.parse({ value })
    }
    if (acc?.schema?._parse?.name === 'parseRecord') {
      return acc.schema.parse({ value })
    }
    if (acc?._parse?.name === 'parseObjectConv') {
      return acc.parse(value)
    }
    return acc.schema.parse(value)
  }
}

export const resolver =
  <T>(schema: T) =>
  (path: string, value: any) => {
    const errors = new Map()

    try {
      path
        .split('.')
        .reduce(
          (acc: any, cv, i, arr) => findPath(acc, cv, i, value, arr),
          schema
        )
    } catch (err: unknown) {
      if (err instanceof z.ValidationError) {
        errors.set(path, err.message)
      } else {
        throw err
      }
    }

    return { errors } as {
      errors: Map<string, string>
      type: z.Infer<T>
    }
  }
