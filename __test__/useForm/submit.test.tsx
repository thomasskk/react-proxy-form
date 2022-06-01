import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { useForm } from '../../src/useForm.js'
import { UseFormReturn } from '../../src/index.js'

describe('useForm', () => {
  describe('submit', () => {
    test('data should reset after submit', async () => {
      let methods: UseFormReturn<any>

      const Component = () => {
        methods = useForm()
        return <input {...methods.register('a.b')} />
      }
      render(<Component />)

      methods.setValue('a.b', true)

      act(() => {
        methods.handleSubmit((data) => {
          expect(data).toEqual({ a: { b: true } })
        })()
        expect(methods.getAllValue()).toEqual({})
      })
    })

    test('data should not reset resetOnSubmit=false', async () => {
      let methods: UseFormReturn<any>

      const Component = () => {
        methods = useForm({
          resetOnSubmit: false,
        })
        return <input {...methods.register('a.b')} />
      }

      render(<Component />)

      methods.setValue('a.b', false)

      act(() => {
        methods.handleSubmit((data) => {
          expect(data).toEqual({ a: { b: false } })
        })()
        expect(methods.getAllValue()).toEqual({ a: { b: false } })
      })
    })

    test('bypass errors when isValidation=false', async () => {
      let methods: UseFormReturn<any>

      const Component = () => {
        methods = useForm({
          isValidation: false,
        })
        return (
          <input
            {...methods.register('a.b', {
              validation: [
                {
                  fn: (v) => v === true,
                  message: 'a.b must be true',
                },
              ],
            })}
          />
        )
      }

      render(<Component />)

      methods.setValue('a.b', false)

      const cb = vi.fn()

      methods.handleSubmit(() => cb())()

      expect(cb).toHaveBeenCalledTimes(1)
    })

    test('lock submit on errors by defaut', async () => {
      let methods: UseFormReturn<any>

      const cb = vi.fn()

      const Component = () => {
        methods = useForm()
        return (
          <input
            {...methods.register('a.b', {
              validation: [
                {
                  fn: (v) => v === true,
                  message: 'a.b must be true',
                },
              ],
            })}
          />
        )
      }

      render(<Component />)

      methods.setValue('a.b', false)

      methods.handleSubmit(() => cb())()

      expect(cb).toHaveBeenCalledTimes(0)
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
