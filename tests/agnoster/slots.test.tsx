/** @jsxImportSource nity */
import { Adapter, InjectionKey } from 'xoid'
import component from 'nity'
import toReact from '@nity/react'
import toVue from '@nity/vue'
import React from 'react'
import { defineComponent, h } from 'vue'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'

export const StoreKey: InjectionKey<number> = Symbol()
export const StoreSetup = (_: undefined, { inject }: Adapter) => inject(StoreKey)

describe('Slots work in React and Vue', () => {
  const AppIsomorphic = component({
    props: [],
    slots: ['default'],
    setup() {
      return () => (
        <div>
          template ref test
          <div>other markup</div>
          {this.slots()}
        </div>
      )
    },
  })

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
