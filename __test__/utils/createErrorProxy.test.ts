import { test, describe, expect, vi } from 'vitest'
import {
  createErrorProxy,
  ErrorProxyCode,
} from '../../src/utils/createErrorProxy'

describe('createErrorProxy', () => {
  test('INIT', () => {
    const proxy = createErrorProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'INIT', cb } as ErrorProxyCode
    expect(proxy.initStore.get('foo')).toEqual(cb)
  })
  test('UPDATE', () => {
    const proxy = createErrorProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'UPDATE', value: 'bar' } as ErrorProxyCode
    proxy['foo'] = { code: 'DELETE' }
    expect(proxy.store.get('foo')).toBeUndefined()
  })
  test('REFRESH', () => {
    const proxy = createErrorProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['bar'] = { code: 'SET', update: cb }
    proxy[''] = { code: 'UPDATE_ALL' }
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('RESET', () => {
    const proxy = createErrorProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['bar'] = { code: 'SET', update: cb }
    proxy[''] = { code: 'RESET' }
    expect(proxy.store.size).toEqual(0)
  })
  test('DELETE', () => {
    const proxy = createErrorProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['bar'] = { code: 'SET', update: cb }
    proxy[''] = { code: 'RESET' }
    expect(proxy.store.size).toEqual(0)
  })
  test('RESET_AND_UPDATE', () => {
    const proxy = createErrorProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['bar'] = { code: 'SET', update: cb }
    proxy[''] = { code: 'RESET' }
    expect(proxy.store.size).toEqual(0)
  })
})
