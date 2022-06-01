;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm.js'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

describe('useForm', () => {
  describe('errors', () => {
    test('error messages should disappear when typing the right value', async () => {
      const cb = vi.fn()

      const Component = () => {
        const { register, errors, handleSubmit } = useForm<{
          a: string
          b: string
        }>()
        const errs = errors()
        return (
          <>
            <input
              {...register('a', {
                validation: [
                  {
                    fn: (value) => value === 'bar',
                    message: 'error a',
                  },
                ],
              })}
            />
            {errs.a?.[0] && <div>{errs.a[0]}</div>}
            <input
              {...register('b', {
                validation: [
                  {
                    fn: (value) => value === 'bar',
                    message: 'error b',
                  },
                ],
              })}
            />
            {errs.b?.[0] && <div>{errs.b[0]}</div>}
            <button onClick={() => handleSubmit(() => cb())()} />
          </>
        )
      }
      render(<Component />)

      expect(screen.queryByText('error a')).toBeNull()
      expect(screen.queryByText('error b')).toBeNull()

      await userEvent.click(screen.getByRole('button'))

      expect(screen.queryByText('error a')).toBeDefined()
      expect(screen.queryByText('error b')).toBeDefined()

      const inputA = screen.getAllByRole('textbox')[0]
      const inputB = screen.getAllByRole('textbox')[1]

      await userEvent.type(inputA, 'bar')

      expect(screen.queryByText('error a')).toBeNull()

      await userEvent.type(inputB, 'bar')

      expect(screen.queryByText('error a')).toBeNull()

      await userEvent.click(screen.getByRole('button'))

      expect(cb).toHaveBeenCalledTimes(1)

      expect(screen.queryByText('error a')).toBeNull()
      expect(screen.queryByText('error b')).toBeNull()
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
