;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { useForm } from '../src/useForm'
import userEvent from '@testing-library/user-event'

describe('useForm', () => {
  describe('watch', () => {
    test('update the value on change', async () => {
      let watched: number | undefined
      const Component = () => {
        const { watch, register } = useForm<
          {
            a: { b: 1 }
          },
          { a: { b: 2 } }
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
  describe('register', () => {})
})
