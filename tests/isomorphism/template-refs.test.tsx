/** @jsx jsx */
import create, { Adapter, Component, InjectionKey } from 'xoid'
import toReact from '@xoid/react'
import toVue from '@xoid/vue'
import React from 'react'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'

export const StoreKey: InjectionKey<number> = Symbol()
export const StoreSetup = (_: undefined, { inject }: Adapter) => inject(StoreKey)

describe('Same isomorphic component can receive template refs in React and Vue', () => {
  const listener = jest.fn()
  const AppIsomorphic: Component<{}> = (_, adapter) => {
    const $ref = create<HTMLDivElement>()
    adapter.effect(() => {
      listener($ref.value?.innerHTML)
    })
    return (_, jsx) => <div ref={$ref.set}>template ref test</div>
  }

  const AppReact = toReact(AppIsomorphic)
  const AppVue = toVue(AppIsomorphic)

  it('React', async () => {
    const { findByText } = renderReact(React.createElement(AppReact))
    await findByText('template ref test')
    expect(listener).toBeCalledWith('template ref test')
  })

  it('Vue', async () => {
    const { findByText } = renderVue(AppVue)
    await findByText('template ref test')
    expect(listener).toBeCalledWith('template ref test')
  })
})
