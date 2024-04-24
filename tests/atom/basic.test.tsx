import { cleanup } from '@testing-library/react'
import { atom } from 'xoid'
import { debug } from '../testHelpers'

const consoleError = console.error
afterEach(() => {
  cleanup()
  console.error = consoleError
})

it('creates a $atom with a primitive value', () => {
  const $atom = atom(5)
  expect(debug($atom)).toMatchSnapshot()
})

it('creates a $atom with a record', () => {
  const $atom = atom({ alpha: 3, beta: 5 })
  expect(debug($atom)).toMatchSnapshot()
})

it('normalizes nested $atoms in a record', () => {
  const $atom = atom({ alpha: atom(3), beta: atom(5) })
  expect(debug($atom)).toMatchSnapshot()
})
