;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen, renderHook } from '@testing-library/react'
import { useForm } from '../src/useForm'
import userEvent from '@testing-library/user-event'

describe('useForm', () => {
  describe('watch', () => {
    test('update on type', async () => {
      let watched: number | undefined
      const Component = () => {
        const { watch, register } = useForm<
          {
            a: { b: number }
          },
          { a: { b: string } }
        >()
        watched = watch('a.b')
        return <input {...register('a.b')} />
      }
      render(<Component />)
      expect(watched).toBeUndefined()
      await userEvent.type(screen.getByRole('textbox'), 'a')
      expect(watched).toEqual('a')
      await userEvent.type(screen.getByRole('textbox'), 'b')
      expect(watched).toEqual('ab')
    })
  })
  describe('register', () => {
    test('return defaultValue', () => {
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
    test('return right value', () => {
      const { result } = renderHook(() => useForm())
      expect(
        result.current.register('a.b', {
          defaultValue: 1,
          type: 'radio',
          value: 2,
          defaultChecked: true,
        })
      ).toMatchObject({
        defaultValue: 1,
        type: 'radio',
        value: 2,
        defaultChecked: true,
        name: 'a.b',
      })
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
    test('', () => {})
  })
})
