;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm'
import userEvent from '@testing-library/user-event'
import React from 'react'

describe('useForm', () => {
  describe('register', () => {
    test('input should get defaultvalue as value', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValue: { a: { b: 1 } },
        })
      )

      expect(result.current.register('a.b')).toMatchObject({
        defaultValue: 1,
      })
    })
    test('return right default value', () => {
      const { result } = renderHook(() => useForm())

      const { ref, name, value, type, onChange, defaultValue, defaultChecked } =
        result.current.register(undefined as any)

      expect(onChange).toBeInstanceOf(Function)

      expect(ref).toBeInstanceOf(Function)

      expect(name).toBeUndefined()

      expect(type).toEqual('text')

      expect(defaultValue).toBeUndefined()

      expect(defaultChecked).toBeUndefined()

      expect(value).toBeUndefined()
    })

    test('return defaultChecked as defaultValue for radio', () => {
      const { result } = renderHook(() => useForm())

      expect(
        result.current.register('a.b', {
          type: 'radio',
          defaultChecked: true,
        }).defaultChecked
      ).toEqual(true)

      expect(
        result.current.register('a.b', {
          type: 'radio',
          defaultChecked: false,
        }).defaultChecked
      ).toEqual(false)
    })

    test('should set an array of value when type is radio', async () => {
      const { result } = renderHook(() => useForm())

      //!
      // fix set default value from register -> defaultValue and defaultChecked
      //!
      result.current.register('a.b', {
        type: 'radio',
        value: 1,
        defaultChecked: true,
      })

      result.current.register('a.b', {
        type: 'radio',
        value: 2,
        defaultChecked: true,
      })

      expect(result.current.getAllValue()).toEqual({ a: [1, 2] })
    })

    test('should set prev value on remount when autoRegister=true', () => {
      const { result, unmount } = renderHook(() =>
        useForm({
          autoUnregister: true,
          defaultValue: { a: 1 },
        })
      )

      result.current.register('a')

      result.current.setValue('a', 2)
      result.current.register('a')

      unmount()

      result.current.register('a')

      expect(result.current.getAllValue()).toEqual({ a: 1 })
    })
    test('should set default value on remount when autoRegister=false', () => {
      const { result, unmount } = renderHook(() =>
        useForm({
          autoUnregister: false,
          defaultValue: { a: 1 },
        })
      )

      result.current.register('a')

      result.current.setValue('a', 2)

      unmount()

      result.current.register('a')

      expect(result.current.getAllValue()).toEqual({ a: 2 })
    })
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
    // test('', () => {})
  })
})
