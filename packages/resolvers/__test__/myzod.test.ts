import { test, describe, expect } from 'vitest'
import { resolver } from '../src/myzod'
import * as z from 'myzod'

describe('myzod', () => {
  test('lazy succeed', () => {
    const path = 'a.[0].a.[0]'

    const schema: any = z.object({
      a: z.array(z.lazy(() => schema)),
    })

    const error = resolver(schema)(path, {
      a: [],
    }).errors.get(path)

    expect(error).toBeUndefined()
  })
  test('lazy fail', () => {
    const path = 'a.[0].a.[0]'

    const schema: any = z.object({
      a: z.array(z.lazy(() => schema)),
    })

    const error = resolver(schema)(path, {
      a: {},
    }).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('tuple succeed', () => {
    const path = 'a'
    const error = resolver(
      z.object({ a: z.tuple([z.string(), z.object({ a: z.boolean() })]) })
    )(path, ['', { a: true }]).errors.get(path)

    expect(error).toBeUndefined()
  })
  test('tuple fail', () => {
    const path = 'a'
    const error = resolver(
      z.object({ a: z.tuple([z.string(), z.object({ a: z.boolean() })]) })
    )(path, ['', {}]).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('literal succeed', () => {
    const path = 'a'
    const error = resolver(z.object({ a: z.literals('a', 'b') }))(
      path,
      'a'
    ).errors.get(path)

    expect(error).toBeUndefined()
  })
  test('literal fail', () => {
    const path = 'a'
    const error = resolver(z.object({ a: z.literals('a', 'b') }))(
      path,
      'c'
    ).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('union succeed', () => {
    const path = 'a.[0]'
    const error = resolver(
      z.object({ a: z.union([z.record(z.string()), z.array(z.number())]) })
    )(path, 1).errors.get(path)

    expect(error).toBeUndefined()
  })
  test('union failed', () => {
    const path = 'a.[0]'
    const error = resolver(
      z.object({ a: z.union([z.record(z.string()), z.array(z.number())]) })
    )(path, {}).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('union deep succeed array', () => {
    const path = 'a.b.[0]'
    const error = resolver(
      z.object({
        a: z.union([
          z.record(z.union([z.array(z.string()), z.record(z.string())])),
          z.array(z.number()),
        ]),
      })
    )(path, '').errors.get(path)

    expect(error).toBeUndefined()
  })
  test('union deep succeed obj', () => {
    const path = 'a.b.a'
    const error = resolver(
      z.object({
        a: z.union([
          z.record(z.union([z.array(z.string()), z.record(z.string())])),
          z.array(z.number()),
        ]),
      })
    )(path, '').errors.get(path)

    expect(error).toBeUndefined()
  })
  test('union deep failed', () => {
    const path = 'a.b.a'
    const error = resolver(
      z.object({
        a: z.union([
          z.record(z.union([z.array(z.string()), z.record(z.string())])),
          z.array(z.number()),
        ]),
      })
    )(path, 1).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('record fail', () => {
    const path = 'a.b'
    const error = resolver(z.object({ a: z.record(z.string()) }))(
      path,
      1
    ).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('depth 1 object succeed', () => {
    const path = 'a'
    const error = resolver(
      z.object({
        a: z.string(),
      })
    )(path, '').errors.get(path)

    expect(error).toBeUndefined()
  })
  test('depth 1 object failed', () => {
    const path = 'a'
    const error = resolver(
      z.object({
        a: z.string(),
      })
    )(path, {}).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('depth 1 array succeed', () => {
    const path = 'a.[0]'
    const error = resolver(
      z.object({
        a: z.array(z.string()),
      })
    )(path, '').errors.get(path)

    expect(error).toBeUndefined()
  })
  test('depth 1 array failed', () => {
    const path = 'a.[0]'
    const error = resolver(
      z.object({
        a: z.array(z.string()),
      })
    )(path, {}).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('depth 2 object succeed', () => {
    const path = 'a.b'
    const error = resolver(
      z.object({
        a: z.object({
          b: z.string(),
        }),
      })
    )(path, '').errors.get(path)

    expect(error).toBeUndefined()
  })
  test('depth 2 object failed', () => {
    const path = 'a.b'
    const error = resolver(
      z.object({
        a: z.object({
          b: z.string(),
        }),
      })
    )(path, {}).errors.get(path)

    expect(error).toBeTruthy()
  })
  test('depth 2 array succeed', () => {
    const path = 'a.[0].[0]'
    const error = resolver(
      z.object({
        a: z.array(z.array(z.string())),
      })
    )(path, '').errors.get(path)

    expect(error).toBeUndefined()
  })
  test('depth 2 array failed', () => {
    const path = 'a.[0].[0]'
    const error = resolver(
      z.object({
        a: z.array(z.array(z.string())),
      })
    )(path, {}).errors.get(path)

    expect(error).toBeTruthy()
  })
})
