/** @jsxImportSource doja */
import Doja, { slots } from 'doja'
import toReact from '@doja/react'
import toVue from '@doja/vue'
import React from 'react'
import { defineComponent, h } from 'vue'
import { render as renderReact } from '@testing-library/react'
import { render as renderVue } from '@testing-library/vue'

describe('Slots work in React and Vue', () => {
  const App = Doja(() => () => (
    <div>
      template ref test
      <div>other markup</div>
      {slots()}
    </div>
  ))

  const AppReact = toReact(App)
  const AppVue = toVue(App)

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
