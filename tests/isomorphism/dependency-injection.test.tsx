import { Adapter, InjectionKey } from 'xoid'
import { createProvider, useSetup as useSetupReact } from '@xoid/react'
import { useSetup as useSetupVue } from '@xoid/vue'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'
import React from 'react'
import vue, { defineComponent, h, provide } from 'vue'

export const StoreKey: InjectionKey<number> = Symbol()
export const StoreSetup = (_: undefined, { inject }: Adapter) => inject(StoreKey)

describe('Same setup, using the same injection key can be used by React and Vue', () => {
  it('React', async () => {
    const StoreProvider = createProvider(StoreKey, 0)
    const App = () => {
      const num = useSetupReact(StoreSetup)
      return <div>injected: {num}</div>
    }

    const { findByText } = renderReact(
      // @ts-ignore
      <StoreProvider value={5}>
        <App />
      </StoreProvider>
    )
    await findByText('injected: 5')
  })

  it('Vue', async () => {
    const App = defineComponent(() => {
      const num = useSetupVue(StoreSetup)
      return () => h('div', ['injected: ', num])
    })

    const Wrapper = defineComponent(() => {
      provide(StoreKey as vue.InjectionKey<number>, 5)
      return () => h(App)
    })

    const { findByText } = renderVue(Wrapper)
    await findByText('injected: 5')
  })
})
