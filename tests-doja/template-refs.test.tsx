/** @jsxImportSource doja */
import create, { effect } from 'xoid'
import toReact from '@doja/react'
import toVue from '@doja/vue'
import React from 'react'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'
import Doja from 'doja'

describe('Same isomorphic component can receive template refs in React and Vue', () => {
  const fn = jest.fn()
  const App = Doja(() => {
    const $ref = create<HTMLDivElement>()
    effect(() => {
      fn($ref.value?.innerHTML)
    })
    return () => <div ref={$ref.set}>template ref test</div>
  })

  const AppReact = toReact(App)
  const AppVue = toVue(App)

  it('React', async () => {
    const { findByText } = renderReact(React.createElement(AppReact))
    await findByText('template ref test')
    expect(fn).toBeCalledWith('template ref test')
  })

  it('Vue', async () => {
    const { findByText } = renderVue(AppVue)
    await findByText('template ref test')
    expect(fn).toBeCalledWith('template ref test')
  })
})
