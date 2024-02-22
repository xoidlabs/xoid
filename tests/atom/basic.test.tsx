import { cleanup } from '@testing-library/react'
import { create } from 'xoid'
import { debug } from './testHelpers'

const consoleError = console.error
afterEach(() => {
  cleanup()
  console.error = consoleError
})

it('creates a atom with a primitive value', () => {
  const atom = create(5)
  expect(debug(atom)).toMatchSnapshot()
})

it('creates a atom with a record', () => {
  const atom = create({ alpha: 3, beta: 5 })
  expect(debug(atom)).toMatchSnapshot()
})

it('normalizes nested atoms in a record', () => {
  const atom = create({ alpha: create(3), beta: create(5) })
  expect(debug(atom)).toMatchSnapshot()
})
