;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from '../../src/useForm'

describe('useForm', () => {
  describe('submit', () => {
    test('', async () => {
      const { result } = renderHook(() => useForm())

      result.current.register('a.b', {
        sideValueName: 'b',
        sideValueAs: 'boolean',
      })

      result.current.setValue('a.b', true)

      act(() => {
        result.current.handleSubmit((data) => {
          expect(data).toEqual({ a: { b: true } })
        })()
      })
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
  })
})
