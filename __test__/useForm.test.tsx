;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen, renderHook } from '@testing-library/react'
import { useForm } from '../src/useForm'
import userEvent from '@testing-library/user-event'

describe('useForm', () => {
  describe('watch', () => {
    test('update the value on type', async () => {
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
    test('return default value', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValue: { a: { b: 1 } },
        })
      )
      expect(result.current.register('a.b')).toMatchObject({
        defaultValue: 1,
      })
    })
    test('return name', () => {
      const { result } = renderHook(() => useForm())
      expect(result.current.register('a.b').name).toEqual('a.b')
    })
    test('return default type text', () => {
      const { result } = renderHook(() => useForm())
      expect(result.current.register('a.b').type).toEqual('text')
    })
    test('return onChange function', () => {
      const { result } = renderHook(() => useForm())
      expect(result.current.register('').onChange).toBeInstanceOf(Function)
    })
    test('return ref function', () => {
      const { result } = renderHook(() => useForm())
      expect(result.current.register('').ref).toBeInstanceOf(Function)
    })
    test('return defaultChecked undefined for radio', () => {
      const { result } = renderHook(() => useForm())
      expect(
        result.current.register('', {
          type: 'radio',
          valueAs: 'boolean',
        }).defaultChecked
      ).toBeUndefined()
    })
    test('return right type', () => {
      const { result } = renderHook(() => useForm())
      expect(
        result.current.register('a.b', {
          type: 'radio',
        }).type
      ).toEqual('radio')
    })
    test('return defaultChecked for radio with defaultValue', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValue: { a: { b: true } },
        })
      )
      expect(
        result.current.register('a.b', {
          type: 'radio',
          valueAs: 'boolean',
          value: true,
        }).defaultChecked
      ).toEqual(true)
      expect(
        result.current.register('a.b', {
          type: 'radio',
          valueAs: 'boolean',
          value: false,
        }).defaultChecked
      ).toEqual(false)
    })
  })
})
