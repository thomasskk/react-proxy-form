import { test, describe, expect } from 'vitest'
import { resolver } from '../src/myzod'
import * as z from 'myzod'

describe('myzod', () => {
  test('record succeed', () => {
    const path = 'a.b'
    const error = resolver(z.object({ a: z.record(z.string()) }))(
      path,
      ''
    ).errors.get(path)

    expect(error).toBeUndefined()
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
