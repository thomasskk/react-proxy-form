import { test, describe, expect, vi } from 'vitest'
import { createUpdateProxy } from '../../src/utils/createUpdateProxy'

describe('createUpdateProxy', () => {
  test('SET', () => {
    const proxy = createUpdateProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    expect(proxy.store.get('foo')).toEqual(cb)
  })
  test('DELETE', () => {
    const proxy = createUpdateProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['foo'] = { code: 'DELETE' }
    expect(proxy.store.get('foo')).toBeUndefined()
  })
  test('UPDATE_ALL', () => {
    const proxy = createUpdateProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['bar'] = { code: 'SET', update: cb }
    proxy[''] = { code: 'UPDATE_ALL' }
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('RESET', () => {
    const proxy = createUpdateProxy()
    const cb = vi.fn()
    proxy['foo'] = { code: 'SET', update: cb }
    proxy['bar'] = { code: 'SET', update: cb }
    proxy[''] = { code: 'RESET' }
    expect(proxy.store.size).toEqual(0)
  })
})
