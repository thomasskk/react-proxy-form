import { test, describe, expect, vi } from 'vitest'
import { isProxy, proxyKeys } from '../../src/utils/proxySymbol'
import { valueProxy } from '../../src/utils/valueProxy'

describe('valueProxy', () => {
  describe('Object value', () => {
    test('get proxy', () => {
      const proxy = valueProxy({ a: 1 }, () => null, ['b'])
      expect(proxy[isProxy]).toBeTruthy()
      expect(proxy[proxyKeys]).toStrictEqual(['b'])
    })
    test('get value', () => {
      const proxy = valueProxy({ a: 1 }, () => null, ['b'])
      expect(proxy.a).toEqual(1)
    })
    test('set with property in keys', () => {
      const cb = vi.fn()
      const proxy = valueProxy({ a: 1 }, cb, ['a'])
      proxy.a = 2
      expect(cb).toHaveBeenCalledOnce()
    })
    test('set with property not in keys', () => {
      const cb = vi.fn()
      const proxy = valueProxy({ a: 1 }, cb, [])
      proxy.a = 2
      expect(proxy.a).toEqual(2)
      expect(cb).toHaveBeenCalledTimes(0)
    })
    test('prev and current value are undefined', () => {
      const cb = vi.fn()
      const proxy = valueProxy({ a: undefined }, cb, ['a'])
      proxy.a = undefined
      expect(cb).toHaveBeenCalledTimes(0)
      expect(proxy).toEqual({})
    })
  })
  describe('Array value', () => {
    test('get proxy', () => {
      const keys = ['0']
      const proxy = valueProxy([0, 1], () => null, keys)
      expect(proxy[isProxy]).toBeTruthy()
      expect(proxy[proxyKeys]).toStrictEqual(keys)
    })
    test('get value', () => {
      const value = [0, 1]
      const proxy = valueProxy(value, () => null, ['0'])
      expect(proxy[0]).toEqual(value[0])
    })
    test('set with property in keys', () => {
      const cb = vi.fn()
      const proxy = valueProxy(['a', 1], cb, ['0'])
      proxy[0] = 2
      expect(proxy[0]).toEqual(2)
      expect(cb).toHaveBeenCalledOnce()
    })
    test('set with property not in keys', () => {
      const cb = vi.fn()
      const proxy = valueProxy(['a', 1], cb, [])
      proxy[0] = 2
      expect(proxy[0]).toEqual(2)
      expect(cb).toHaveBeenCalledTimes(0)
    })
    test('prev and current value are undefined', () => {
      const cb = vi.fn()
      const proxy = valueProxy([undefined, 1], cb, ['0'])
      proxy[0] = undefined
      expect(cb).toHaveBeenCalledTimes(0)
      expect(proxy).toEqual([1])
    })
  })
})
