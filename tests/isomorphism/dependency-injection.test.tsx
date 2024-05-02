import { inject, InjectionKey } from 'xoid'
import { createProvider as createProviderReact, useSetup as useSetupReact } from '@xoid/react'
import { createProvider as createProviderVue, useSetup as useSetupVue } from '@xoid/vue'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'
import React from 'react'
import { defineComponent, h } from 'vue'

export const StoreKey: InjectionKey<number> = Symbol()
export const StoreSetup = () => inject(StoreKey)

describe('Same setup, using the same injection key can be used by React and Vue', () => {
  it('React', async () => {
    const ProviderReact = createProviderReact(StoreKey, 0)
    const AppReact = () => {
      const num = useSetupReact(StoreSetup)
      return <div>injected: {num}</div>
    }
    const { findByText } = renderReact(
      // @ts-ignore
      <ProviderReact value={5}>
        <AppReact />
      </ProviderReact>
    )
    await findByText('injected: 5')
  })
  it('Vue', async () => {
    const ProviderVue = createProviderVue(StoreKey, 0)
    const AppVue = defineComponent(() => {
      const num = useSetupVue(StoreSetup)
      return () => h('div', ['injected: ', num])
    })
    const Wrapper = defineComponent(() => {
      return () => h(ProviderVue, { value: 5 }, () => [h(AppVue), ' ', h('div', {}, 'other slot')])
    })
    const { findByText } = renderVue(Wrapper)
    await findByText('injected: 5')
    await findByText('other slot')
  })
})
