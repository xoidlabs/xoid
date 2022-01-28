import React, { useEffect } from 'react'
import Layout from '@theme/Layout'
import CodeBlock from '@theme/CodeBlock'
import GitHubButton from 'react-github-btn'
import Head from '@docusaurus/Head'
import useBaseUrl from '@docusaurus/useBaseUrl'
import marked from 'marked'

const textContent = {
  left: `
- Easy to learn
- Not limited to React
- Extensive Typescript support
- Small bundle size
- Doesn't need any middleware for async
- Computed values
- Deeply nested states
- Transient updates
- Destructure state without losing reactivity
- Same API for local and global state
- Finite state machines
  `,
  right: `
    `,
}

const codeBlocks = [
  {
    text: `### Intuitive & Familiar API

Provides a similar API to **Recoil**. 
Except, in the second argument of \`create\` method, you can specify actions for your store. Also, you can create derived stores with computed values.

`,
    code: `import { create, set } from 'xoid'

const numberActions = (store) => ({
  increment: () => set(store, (s) => s + 1),
  decrement: () => set(store, (s) => s - 1)
})
const alpha = create(3, numberActions)
const beta = create(4, numberActions)

// derived state
const sum = create(get => get(alpha) + get(beta))
`,
  },
  {
    text: `
### React & Vanilla

No need for wrapping components into context providers. 
Just import \`useStore\` and start using! You can also use \`use\` method to access the actions of a store, without causing rerenders. (it's not a hook)

`,
    code: `import { useStore, use, subscribe } from 'xoid'

// in a React component
const [number, { increment, decrement }] = useStore(alpha)

// use the actions only, without causing rerender
const { increment, decrement } = use(alpha)

// outside React
const unsubscribe = subscribe(alpha, a => console.log(a))
`,
  },
  {
    text: `
### No more selector functions!

Every store is a *representation* of state, with the same tree structure as the state. 
You can even subscribe to "primitives" like strings or numbers.

`,
    code: `import { create, useStore } from 'xoid'

const store = create({ name: 'John', surname: 'Doe' })

// in a React component
const [name, setName] = useStore(store.name)
`,
  },
  {
    text: `
### No more hand-written reducers!

With \`set\` method, you can surgically modify the parts in your state.
This means that you can modify deeply nested values without having to write a lot of code, or without using tools like **immer** or **immutablejs**.

`,
    code: `import { create, get, set } from 'xoid'

const store = create({ deeply: { nested: { foo: 5 } } })
const foo = store.deeply.nested.foo

console.log(get(foo)) // 5

// set the value surgically into the store
set(foo, 25)

console.log(get(store)) // { deeply: { nested: { foo: 25 } } }
`,
  },
  {
    text: `
### Nested Stores 
You can store your application's data as deeply nested structures without worrying about UI performance. While using \`useStore\` hook, **xoid** never automatically subscribes to child stores.

`,
    code: `import { create, set } from 'xoid'

const store = create({ title: 'hello', oftenUpdatingChildStore: create(0) })
setInterval(() => set(store.oftenUpdatingChildStore, (count) => count + 1, 50)

// In a React component
const [state] = useStore(store)
// a child store is subscribed, only if it's read
console.log(state.oftenUpdatingChildStore)
`,
  },
  {
    text: `
### No-API Finite State Machines!
No additional syntax is required to define and use finite state machines. Just use the second argument of the callback as the state transition function.

`,
    code: `import { create, useStore } from 'xoid'

const machine = create((get, set) => {
  const red = { color: '#f00', onClick: () => set(green) }
  const green = { color: '#0f0', onClick: () => set(red) }
  return red
})

// in a React component
const [{ color, onClick }] = useStore(machine)
return <div style={{ color }} onClick={onClick}/>
`,
  },
  {
    text: `
### Models 
Perhaps, the most powerful feature of **xoid** is this one. Here's an example of easy state (de)serialization. (Your plain JSON data comes alive with your pre-defined actions in your model schemas) 

Another benefit of using models are builtin \`add\` and \`remove\` actions. They are present in the actions by default if a store is created via \`arrayOf\` or \`objectOf\` helpers. These builtin actions have 100% consistent TypeScript types with your model schemas.

`,
    code: `import { create, arrayOf, get, set, use } from 'xoid'

const EmployeeModel = (payload) => create(
  { name: payload.name }, 
  (store) => ({ greet: () => console.log(\`Hey \${get(store.name)}!\`) })
)

const CompanyModel = (payload) => create({
  name: payload.name,
  employees: arrayOf(EmloyeeModel, payload.employees),
})

const companyStore = CompanyModel({
  name: 'my-awesome-company',
  employees: [{ name: 'you' }, { name: 'me' }]
})

use(companyStore.employees[0]).greet() // Hey you!

const myName = companyStore.employees[1].name
console.log(get(myName)) // 'me'
set(myName, 'my new name')
console.log(get(myName)) // 'my new name'

use(companyStore.employees).add({ name: 'third employee'})
use(companyStore.employees[2]).greet() // Hey third employee!

// remove by key, or by a filter function
use(companyStore.employees).remove(2)
use(companyStore.employees).remove(item => item.name === 'third employee')

// if \`employees\` was an "objectOf(EmployeeModel)"
use(companyStore.employees).add({ name: 'third employee'}, '0000')
use(companyStore.employees).remove('0000')
use(companyStore.employees).remove(item => item.name === 'third employee')`,
  },
]

function Heading({ text }) {
  return <h2 className="Heading">{text}</h2>
}

function ActionButton({ href, type = 'primary', target, children }) {
  return (
    <a className={`ActionButton ${type}`} href={href} target={target}>
      {children}
    </a>
  )
}

function TextColumn({ title, text, moreContent }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: text }} />
      {moreContent}
    </>
  )
}

function HomeCallToAction() {
  return (
    <>
      <ActionButton
        type="primary"
        href={useBaseUrl('docs/getting-started')}
        target="_self">
        Get started
      </ActionButton>
      <ActionButton
        type="secondary"
        href={useBaseUrl('docs/examples')}
        target="_self">
        Examples
      </ActionButton>
    </>
  )
}

function TwitterButton() {
  return (
    <a
      href="https://twitter.com/intent/follow?screen_name=xoid&region=follow_link"
      className="twitter-follow-button">
      <div className="icon" />
      Follow @xoid
    </a>
  )
}

function GitHubStarButton() {
  return (
    <div className="github-button">
      <GitHubButton
        href="https://github.com/onurkerimov/xoid"
        data-icon="octicon-star"
        data-size="large"
        aria-label="Star onurkerimov/xoid on GitHub">
        Star
      </GitHubButton>
    </div>
  )
}

function Section({
  element = 'section',
  children,
  className,
  background = 'light',
}) {
  const El = element
  return <El className={`Section ${className} ${background}`}>{children}</El>
}

function TwoColumns({ columnOne, columnTwo, reverse }) {
  return (
    <div className={`TwoColumns ${reverse ? 'reverse' : ''}`}>
      <div className={`column first ${reverse ? 'right' : 'left'}`}>
        {columnOne}
      </div>
      <div className={`column last ${reverse ? 'left' : 'right'}`}>
        {columnTwo}
      </div>
    </div>
  )
}

function HeaderHero() {
  return (
    <Section background="none" className="HeaderHero">
      {/* <GitHubStarButton /> */}
      <div className="titleContainer">
        <div className="title">
          <img
            alt="xoid"
            src={useBaseUrl('img/xoid-black.png')}
            height="90px"
            style={{ margin: 'auto' }}
          />
        </div>
        <p className="tagline">
          Scalable, fine-grained, and minimal state-management library for React
          and vanilla JavaScript
        </p>
        <div className="buttons">
          <HomeCallToAction />
        </div>
      </div>
    </Section>
  )
}

function NativeApps() {
  return (
    <Section className="NativeApps" background="light">
      {/* <TwoColumns
        reverse
        columnOne={
          <div dangerouslySetInnerHTML={{__html: marked(textContent.intro)}} />
        }
        columnTwo={
          <div dangerouslySetInnerHTML={{__html: marked(textContent.intro)}} />
        }
      /> */}
      <div className="FeatureSection">
        <div dangerouslySetInnerHTML={{ __html: marked(textContent.left) }} />
        <div dangerouslySetInnerHTML={{ __html: marked(textContent.right) }} />
      </div>
    </Section>
  )
}

function NativeCode(props) {
  return (
    <Section className="NativeCode" background={props.tint ? 'tint' : 'light'}>
      <TwoColumns
        columnOne={<TextColumn text={marked(props.content.text)} />}
        columnTwo={<CodeBlock language="jsx">{props.content.code}</CodeBlock>}
      />
    </Section>
  )
}

const Index = () => {
  return (
    <Layout wrapperClassName="homepage">
      <Head>
        <title>
          xoid · Scalable state-management library for React and vanilla
        </title>
        {/* <script async defer src="https://buttons.github.io/buttons.js"></script> */}
      </Head>
      <HeaderHero />
      <NativeApps />
      {codeBlocks.map((content, i) => (
        <NativeCode content={content} tint={!(i % 2)} />
      ))}
    </Layout>
  )
}

export default Index
