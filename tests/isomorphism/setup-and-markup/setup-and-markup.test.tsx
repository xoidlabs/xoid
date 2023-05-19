import React from 'react'

import { fireEvent, render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'
import CounterReact from './CounterReact'
import CounterVue from './CounterVue'

describe('Same isomorphic component works in React and Vue', () => {
  const loggerFn = jest.fn()
  let consoleLog: any

  beforeEach(() => {
    consoleLog = console.log
    console.log = loggerFn
  })

  afterEach(() => {
    console.log = consoleLog
    jest.resetAllMocks()
  })

  test('React', async () => {
    const { findByText, getByText, rerender, unmount } = renderReact(
      // @ts-ignore
      <CounterReact initialValue={5}>
        <span>a slot renders me</span>
      </CounterReact>
    )

    expect(loggerFn).toBeCalledTimes(1)
    expect(loggerFn).toBeCalledWith('mounted')

    await findByText('count: 5')
    fireEvent.click(getByText('+'))
    await findByText('count: 6')

    rerender(<CounterReact initialValue={25} />)

    await findByText('count: 25')
    fireEvent.click(getByText('-'))
    await findByText('count: 24')

    unmount()
    expect(loggerFn).toBeCalledTimes(2)
    expect(loggerFn).toBeCalledWith('unmounted')
  })

  /* eslint-disable react-hooks/rules-of-hooks */
  test('Vue', async () => {
    const { findByText, getByText, rerender, unmount } = renderVue(CounterVue, {
      props: { initialValue: 5 },
    })

    expect(loggerFn).toBeCalledTimes(1)
    expect(loggerFn).toBeCalledWith('mounted')

    await findByText('count: 5')
    fireEvent.click(getByText('+'))
    await findByText('count: 6')

    rerender({ initialValue: 25 })

    await findByText('count: 25')
    fireEvent.click(getByText('-'))
    await findByText('count: 24')

    unmount()
    expect(loggerFn).toBeCalledTimes(2)
    expect(loggerFn).toBeCalledWith('unmounted')
  })
})
