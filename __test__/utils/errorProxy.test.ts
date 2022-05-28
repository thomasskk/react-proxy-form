import { test, describe, expect, vi } from 'vitest'
import { errorProxy, iM, mM } from '../../src/utils/errorProxy'
import {
  deleteSymbol,
  resetSymbol,
  setSymbol,
  updateSymbol,
  ProxyCode as PC,
  resetAndUpdateSymbol,
  refreshSymbol,
} from '../../src/utils/proxySymbol'

describe('errorProxy', () => {
  test('setSymbol', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <PC>{ code: setSymbol, cb }
    expect(proxy[iM].get('foo')).toEqual(cb)
  })
  test('updateSymbol', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <PC>{ code: setSymbol, cb }
    proxy['foo'] = <PC>{
      code: updateSymbol,
      value: 'bar',
    }
    expect(cb).toHaveBeenCalledOnce()
    expect(proxy[mM].get('foo')).toEqual('bar')
  })
  test('refreshSymbol', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <PC>{ code: setSymbol, cb }
    proxy['foo'] = <PC>{
      code: updateSymbol,
      value: 'bar',
    }
    proxy['foo'] = <PC>{ code: refreshSymbol }
    expect(proxy[mM].get('foo')).toBeUndefined()
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('resetSymbol', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <PC>{ code: setSymbol, cb }
    proxy['foo'] = <PC>{
      code: updateSymbol,
      value: 'bar',
    }
    proxy['foo'] = <PC>{ code: resetSymbol }
    expect(proxy[mM].size).toEqual(0)
  })
  test('deleteSymbol', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <PC>{ code: setSymbol, cb }
    proxy['foo'] = <PC>{
      code: updateSymbol,
      value: 'bar',
    }
    proxy['foo'] = <PC>{ code: deleteSymbol }
    expect(proxy[mM].get('foo')).toBeUndefined()
    expect(proxy[iM].get('foo')).toBeUndefined()
  })
  test('resetAndUpdateSymbol', () => {
    const proxy = errorProxy()
    const cb = vi.fn()
    proxy['foo'] = <PC>{ code: setSymbol, cb }
    proxy['foo'] = <PC>{
      code: updateSymbol,
      value: 'bar',
    }
    proxy[''] = <PC>{ code: resetAndUpdateSymbol, value: '' }
    expect(proxy[mM].size).toEqual(0)
    expect(cb).toHaveBeenCalledTimes(2)
  })
})
