import { test, describe, expect, vi } from 'vitest'
import { valueProxy, isProxy, proxyKeys } from '../../src/utils/valueProxy'

describe('valueProxy', () => {
  describe('Object value', () => {
    test('get proxy', () => {
      const proxy = valueProxy({
        value: { a: 1 } as any,
        cb: () => {},
        keys: ['b'],
      })
      expect(proxy[isProxy]).toBeTruthy()
      expect(proxy[proxyKeys]).toStrictEqual(['b'])
    })
    test('get value', () => {
      const args = {
        value: { a: 1 },
        cb: () => {},
        keys: ['b'],
      }
      const proxy = valueProxy(args)
      expect(proxy.a).toEqual(1)
    })
    test('set with property in keys', () => {
      const args = {
        cb: vi.fn(),
        keys: ['a'],
        value: { a: 1 },
      }
      const proxy = valueProxy(args)
      proxy.a = 2
      expect(args.cb).toHaveBeenCalledOnce()
    })
    test('set with property not in keys', () => {
      const args = {
        cb: vi.fn(),
        keys: [],
        value: { a: 1 },
      }
      const proxy = valueProxy(args)
      proxy.a = 2
      expect(proxy.a).toEqual(2)
      expect(args.cb).toHaveBeenCalledTimes(0)
    })
    test('prev and current value are undefined', () => {
      const args = {
        cb: vi.fn(),
        keys: ['a'],
        value: { a: undefined },
      }
      const proxy = valueProxy(args)
      proxy.a = undefined
      expect(args.cb).toHaveBeenCalledTimes(0)
      expect(proxy).toEqual({})
    })
  })
  describe('Array value', () => {
    test('get proxy', () => {
      const args = {
        cb: () => {},
        keys: ['0'],
        value: [0, 1],
      }
      const proxy = valueProxy(args)
      expect(proxy[isProxy as any]).toBeTruthy()
      expect(proxy[proxyKeys as any]).toStrictEqual(args.keys)
    })
    test('get value', () => {
      const args = {
        value: [0, 1],
        cb: () => {},
        keys: ['0'],
      }
      const proxy = valueProxy(args)
      expect(proxy[0]).toEqual(args.value[0])
    })
    test('set with property in keys', () => {
      const args = {
        value: ['a', 1],
        cb: vi.fn(),
        keys: ['0'],
      }
      const proxy = valueProxy(args)
      proxy[0] = 2
      expect(proxy[0]).toEqual(2)
      expect(args.cb).toHaveBeenCalledOnce()
    })
    test('set with property not in keys', () => {
      const args = {
        value: ['a', 1],
        cb: vi.fn(),
        keys: [],
      }
      const proxy = valueProxy(args)
      proxy[0] = 2
      expect(proxy[0]).toEqual(2)
      expect(args.cb).toHaveBeenCalledTimes(0)
    })
    test('prev and current value are undefined', () => {
      const args = {
        value: [undefined, 1],
        cb: vi.fn(),
        keys: ['0'],
      }
      const proxy = valueProxy(args)
      proxy[0] = undefined
      expect(args.cb).toHaveBeenCalledTimes(0)
      expect(proxy).toEqual([1])
    })
  })
})
