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
        const { register, errors, error, handleSubmit } = useForm<{
          a: { b: number; c: number }
        }>()
        const errs = errors()
        const err = error('a.c')
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
            <input
              {...register('a.c', {
                valueAs: Number,
                defaultValue: 0,
                validation: [
                  {
                    fn: (value) => value > 1,
                    message: 'must be greater than 1',
                  },
                ],
              })}
            />
            {<div>{errs?.['a.b']?.[0]}</div>}
            {<div>{err?.[0]}</div>}
            <button onClick={() => handleSubmit()()} />
          </>
        )
      }
      render(<Component />)
      await userEvent.click(screen.getByRole('button'))
      expect(screen.getAllByText('must be greater than 0'))
      expect(screen.getAllByText('must be greater than 1'))
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
