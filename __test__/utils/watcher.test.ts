import { act, renderHook } from '@testing-library/react'
import { test, describe, expect } from 'vitest'
import { updateProxy } from '../../src/utils/updateProxy'
import { watcher } from '../../src/utils/watcher'
import { renderHookWithCount } from '../helper'

describe('watcher', () => {
  test('value doesnt exist', () => {
    const { result } = renderHook(() =>
      watcher({
        object: { a: {} } as any,
        path: 'a.b',
        updateStore: updateProxy(),
        watchStore: new Set(),
      })
    )
    expect(result.current).toBeUndefined()
  })
  test('return right value on init', () => {
    const { result } = renderHook(() =>
      watcher({
        object: { a: { b: 1 } },
        path: 'a.b',
        updateStore: updateProxy(),
        watchStore: new Set(),
      })
    )
    expect(result.current).toBe(1)
  })
  test('should set cb in updateStore', () => {
    const updateStore = updateProxy()
    renderHook(() =>
      watcher({
        object: { a: { b: 1 } },
        path: 'a.b',
        updateStore,
        watchStore: new Set(),
      })
    )
    expect(updateStore.s.get('a.b')).toBeInstanceOf(Function)
  })
  test('rerender when value change', () => {
    const updateStore = updateProxy()
    const object = { a: { b: 1 } }
    const { renderCount } = renderHookWithCount(() =>
      watcher({
        object,
        path: 'a.b',
        updateStore,
        watchStore: new Set(),
      })
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
      watcher({
        object,
        path: 'a.b',
        updateStore,
        watchStore: new Set(),
      })
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
      watcher({
        object: { a: { b: 1 } },
        path: 'a.b',
        updateStore,
        watchStore: new Set(),
      })
    )
    unmount()
    expect(updateStore.s.get('a.b')).toBeUndefined()
    expect(watchStore.has('a.b')).toBeFalsy()
  })
})
