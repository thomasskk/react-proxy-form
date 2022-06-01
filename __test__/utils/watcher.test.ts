import { act, renderHook } from '@testing-library/react'
import { test, describe, expect } from 'vitest'
import { updateProxy } from '../../src/utils/updateProxy.js'
import { watcher } from '../../src/utils/watcher.js'
import { renderHookWithCount } from '../helper.js'

describe('watcher', () => {
  test('value doesnt exist', () => {
    const { result } = renderHook(() =>
      watcher({ a: {} } as any, 'a.b', updateProxy(), new Set())
    )
    expect(result.current).toBeUndefined()
  })
  test('return right value on init', () => {
    const { result } = renderHook(() =>
      watcher({ a: { b: 1 } }, 'a.b', updateProxy(), new Set())
    )
    expect(result.current).toBe(1)
  })
  test('should set cb in updateStore', () => {
    const updateStore = updateProxy()
    renderHook(() => watcher({ a: { b: 1 } }, 'a.b', updateStore, new Set()))
    expect(updateStore.s.get('a.b')).toBeInstanceOf(Function)
  })
  test('rerender when value change', () => {
    const updateStore = updateProxy()
    const object = { a: { b: 1 } }
    const { renderCount } = renderHookWithCount(() =>
      watcher(object, 'a.b', updateStore, new Set())
    )
    expect(renderCount()).toBe(1)
    act(() => {
      object.a.b = 2
    })
    expect(renderCount()).toEqual(2)
  })
  test('return updated value on change', () => {
    const updateStore = updateProxy()
    const object = { a: { b: 1 } }
    const { result } = renderHookWithCount(() =>
      watcher(object, 'a.b', updateStore, new Set())
    )
    act(() => {
      object.a.b = 2
    })
    expect(result.current).toEqual(2)
  })
  test('delete value from updateStore and watchStore on unmount', () => {
    const updateStore = updateProxy()
    const watchStore = new Set('a.b')
    const { unmount } = renderHook(() =>
      watcher({ a: { b: 1 } }, 'a.b', updateStore, new Set())
    )
    unmount()
    expect(updateStore.s.get('a.b')).toBeUndefined()
    expect(watchStore.has('a.b')).toBeFalsy()
  })
})
