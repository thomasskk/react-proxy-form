import { test, describe, expect } from 'vitest'
import { createValueProxy } from '../../src/utils/createValueProxy'

describe('createValueProxy', () => {
  describe('set', () => {
    test('', () => {
      const proxy = createValueProxy({}, () => {}, ['test'])
    })
    describe('set', () => {
      test('', () => {})
    })
  })
})
