import { test, describe, expect, vi } from 'vitest'
import {
  errorProxy,
  ErrorProxyCode as EPC,
  initStore,
  mssgStore,
} from '../../src/utils/errorProxy'

describe('errorProxy', () => {
  test('SET', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <EPC>{ code: 'SET', cb }
    expect(proxy[initStore].get('foo')).toEqual(cb)
  })
  test('UPDATE', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <EPC>{ code: 'SET', cb }
    proxy['foo'] = <EPC>{
      code: 'UPDATE',
      value: 'bar',
    }
    expect(cb).toHaveBeenCalledOnce()
    expect(proxy[mssgStore].get('foo')).toEqual('bar')
  })
  test('REFRESH', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <EPC>{ code: 'SET', cb }
    proxy['foo'] = <EPC>{
      code: 'UPDATE',
      value: 'bar',
    }
    proxy['foo'] = <EPC>{ code: 'REFRESH' }
    expect(proxy[mssgStore].get('foo')).toBeUndefined()
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('RESET', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <EPC>{ code: 'SET', cb }
    proxy['foo'] = <EPC>{
      code: 'UPDATE',
      value: 'bar',
    }
    proxy['foo'] = <EPC>{ code: 'RESET' }
    expect(proxy[mssgStore].size).toEqual(0)
  })
  test('DELETE', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <EPC>{ code: 'SET', cb }
    proxy['foo'] = <EPC>{
      code: 'UPDATE',
      value: 'bar',
    }
    proxy['foo'] = <EPC>{ code: 'DELETE' }
    expect(proxy[mssgStore].get('foo')).toBeUndefined()
    expect(proxy[initStore].get('foo')).toBeUndefined()
  })
  test('RESET_AND_UPDATE', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <EPC>{ code: 'SET', cb }
    proxy['foo'] = <EPC>{
      code: 'UPDATE',
      value: 'bar',
    }
    proxy[''] = <EPC>{ code: 'RESET_AND_UPDATE', value: '' }
    expect(proxy[mssgStore].size).toEqual(0)
    expect(cb).toHaveBeenCalledTimes(2)
  })
})
