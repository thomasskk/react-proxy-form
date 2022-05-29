;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm'
import userEvent from '@testing-library/user-event'

describe('useForm', () => {
  describe('error', () => {
    test.only('', async () => {
      const Component = () => {
        const { register, error, handleSubmit } = useForm<{
          a: { b: number }
        }>()
        const err = error('a.b')
        return (
          <>
            <input
              {...register('a.b', {
                valueAs: Number,
                defaultValue: 0,
                validation: [
                  {
                    fn: (value) => value > 0,
                    message: 'must be greater than 0',
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
      expect(screen.getByText('must be greater than 0'))
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
