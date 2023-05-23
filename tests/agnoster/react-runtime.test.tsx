/** @jsxImportSource nity */
import component from 'nity'
import toReact from '@nity/react'
import toVue from '@nity/vue'

import React from 'react'
import { render as renderReact } from '@testing-library/react'

import { h } from 'vue'
import { render as renderVue } from '@testing-library/vue'

const Parent = component({
  setup() {
    return () => (
      <div>
        <Child />
      </div>
    )
  },
})

const Child = component({
  setup() {
    return () => <div>count: 1</div>
  },
})

it.only('uses the actions in React', async () => {
  const ParentReact = toReact(Parent)
  const { findByText } = renderReact(React.createElement(ParentReact))

  await findByText('count: 1')
})

it.only('uses the actions in Vue', async () => {
  const ParentVue = toVue(Parent)
  const { findByText } = renderVue(h(ParentVue))

  await findByText('count: 1')
})
