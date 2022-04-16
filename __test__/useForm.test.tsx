globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useForm } from '../src/useForm'
import userEvent from '@testing-library/user-event'

describe('useForm', () => {
  let watchedValue: string | undefined
  test('', async () => {
    const Component = () => {
      const { watchValue, register } = useForm<{
        a: string
      }>()
      watchedValue = watchValue('a')
      return <input role='textbox' {...register('a')} />
    }
    render(<Component />)

    userEvent.type(screen.getByRole('textbox'), '1')

    await waitFor(() => {
      expect(watchedValue).toEqual('1')
    })
  })
})
