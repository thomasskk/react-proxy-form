globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { useForm } from '../src/useForm'
import userEvent from '@testing-library/user-event'
import { undefined } from '@badrap/valita'

describe('useForm', () => {
  describe('watch', () => {
    test('update the value on change', async () => {
      let watched: string | undefined
      const Component = () => {
        const { watch, register } = useForm<{
          a: string
        }>()
        watched = watch('a')
        return <input {...register('a')} />
      }

      render(<Component />)

      await userEvent.type(screen.getByRole('textbox'), 'a')
      expect(watched).toEqual('a')
      await userEvent.type(screen.getByRole('textbox'), 'b')
      expect(watched).toEqual('ab')
    })

    test('return undefined when name ', async () => {
      let watched: string | undefined
      const Component = () => {
        const { watch, register } = useForm<{
          a: { b: 1 }
          b: [1, { c: [2] }]
        }>()
        const watched = watch('b.[1]')
        return null
      }

      render(<Component />)

      await waitFor(() => expect(watched).toEqual(undefined))
    })
  })
})
