;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import React from 'react'
import { render, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm.js'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'

describe('useForm', () => {
  describe('error', () => {
    test('error message should disappear when typing the right value', async () => {
      const Component = () => {
        const { register, error, handleSubmit } = useForm<{
          a: string
        }>()
        const err = error('a')
        return (
          <>
            <input
              {...register('a', {
                defaultValue: 'foo',
                validation: [
                  {
                    fn: (value) => value === 'bar',
                    message: 'error message',
                  },
                ],
              })}
            />
            {<div>{err?.[0]}</div>}
            <button onClick={() => handleSubmit()()} />
          </>
        )
      }
      render(<Component />)
      await userEvent.click(screen.getByRole('button'))
      expect(screen.queryByText('error message')).toBeDefined()
      await userEvent.clear(screen.getByRole('textbox'))
      expect(screen.queryByText('error message')).toBeDefined()
      await userEvent.type(screen.getByRole('textbox'), 'bar')
      expect(screen.queryByText('error message')).toBeNull()
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
