/** @jsxImportSource xoid/src */
import { Adapter, InjectionKey, Component } from 'xoid'
import toReact from '@xoid/react/src/runtime'
import toVue from '@xoid/vue/src/runtime'
import React from 'react'
import { defineComponent, h } from 'vue'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'

export const StoreKey: InjectionKey<number> = Symbol()
export const StoreSetup = (_: undefined, { inject }: Adapter) => inject(StoreKey)

describe('Slots work in React and Vue', () => {
  const AppIsomorphic: Component<{}> = {
    props: [],
    slots: ['default'],
    render() {
      return () => (
        <div>
          template ref test
          <div>other markup</div>
          {this.slot()}
        </div>
      )
    },
  }

  const AppReact = toReact(AppIsomorphic)
  const AppVue = toVue(AppIsomorphic)

  it('React', async () => {
    const { findByText } = renderReact(
      React.createElement(AppReact, {} as any, React.createElement('span', {}, 'Hello!'))
    )
    await findByText('Hello!')
  })

  it('Vue', async () => {
    const Wrapper = defineComponent(() => {
      // @ts-ignore
      return () => h(AppVue, {}, [h('span', {}, 'Hello!')])
    })

    const { findByText } = renderVue(Wrapper)
    await findByText('Hello!')
  })
})
// How we're gonna export <vue-header v-slot:logo="" v-slot:nav="" />
// and                    <ReactHeader logo={} nav={} />