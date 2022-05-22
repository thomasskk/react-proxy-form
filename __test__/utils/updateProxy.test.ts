import { test, describe, expect, vi } from 'vitest'
import {
  updateProxy,
  UpdateProxyCode as UPC,
} from '../../src/utils/updateProxy'

describe('updateProxy', () => {
  test('SET', () => {
    const proxy = updateProxy()
    const cb = vi.fn()
    proxy['foo'] = <UPC>{ code: 'SET', update: cb }
    expect(proxy.store.get('foo')).toEqual(cb)
  })
  test('DELETE', () => {
    const proxy = updateProxy()
    const cb = vi.fn()
    proxy['foo'] = <UPC>{ code: 'SET', update: cb }
    proxy['foo'] = <UPC>{ code: 'DELETE' }
    expect(proxy.store.get('foo')).toBeUndefined()
  })
  test('UPDATE', () => {
    const proxy = updateProxy()
    const cb = vi.fn()
    proxy['foo'] = <UPC>{ code: 'SET', update: cb }
    proxy['foo'] = <UPC>{ code: 'UPDATE' }
    expect(cb).toHaveBeenCalledOnce()
  })
  test('UPDATE_ALL', () => {
    const proxy = updateProxy()
    const cb = vi.fn()
    proxy['foo'] = <UPC>{ code: 'SET', update: cb }
    proxy['bar'] = <UPC>{ code: 'SET', update: cb }
    proxy[''] = <UPC>{ code: 'UPDATE_ALL' }
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('RESET', () => {
    const proxy = updateProxy()
    const cb = vi.fn()
    proxy['foo'] = <UPC>{ code: 'SET', update: cb }
    proxy['bar'] = <UPC>{ code: 'SET', update: cb }
    proxy[''] = <UPC>{ code: 'RESET' }
    expect(proxy.store.size).toEqual(0)
  })
})
