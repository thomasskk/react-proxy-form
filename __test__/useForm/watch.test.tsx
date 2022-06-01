import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm.js'
import userEvent from '@testing-library/user-event'

describe('useForm', () => {
  describe('watch', () => {
    test('update on type', async () => {
      let watched: number | undefined
      const Component = () => {
        const { watch, register } = useForm<{
          a: { b: number }
        }>()
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
