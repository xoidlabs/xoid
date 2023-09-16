/** @jsxImportSource doja */
import Doja from 'doja'
import toReact from '@doja/react'
import toVue from '@doja/vue'

import { h } from 'vue'
import { render as renderVue } from '@testing-library/vue'

import React from 'react'
import { render as renderReact } from '@testing-library/react'

const Parent = Doja(() => () => (
  <div>
    <Child />
  </div>
))

const Child = Doja(() => () => <div>count: 1</div>)

it('Renders markup in React', async () => {
  const ParentReact = toReact(Parent)
  const { findByText } = renderReact(React.createElement(ParentReact))

  await findByText('count: 1')
})

it.only('Renders markup in Vue', async () => {
  const ParentVue = toVue(Parent)
  const { findByText } = renderVue(h(ParentVue))

  await findByText('count: 1')
})
