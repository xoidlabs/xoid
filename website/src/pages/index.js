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
- Same API for local and global state
- Finite state machines
  `,
  right: `
    `,
}

const codeBlocks = [
  {text: `### Simple primitives
**xoid** is based on *atoms*. Atoms are standalone setter/getter objects that hold state. \`create\` function is used to create them.

It has a **Recoil**-inspired API for derived atoms. 

  `,
code: `import { create } from 'xoid'

const atom = create(3)
atom() // 3 (get the value)
atom(5) // void (set the value to 5)
atom((state) => state + 1) // void (also set the value)
atom() // 6

const derivedAtom = create(get => get(atom) * 2)
`},
  {
    text: `### Actions

With the second argument, you can specify actions for your atoms. \`use\` function is used to grab these actions.

`,
    code: `import { create, use } from 'xoid'

const counterAtom = create(3, (atom) => ({
  increment: () => atom((s) => s + 1),
  incrementBy: (by) => atom((s) => s + by)
}))

use(counterAtom).incrementBy(5)
setInterval(use(counterAtom).increment, 1000)
`,
  },
  {
    text: `
### React integration

**xoid** has a minimal React integration. 
No need for wrapping components into context providers. 
Just import \`useAtom\` and start using!

`,
    code: `import { create, subscribe, use } from 'xoid'
import { useAtom } from '@xoid/react'

// in a React component
const count = useAtom(counterAtom)
const { increment } = use(counterAtom)

// outside React
const unsubscribe = subscribe(alpha, console.log)
`,
  },
  {
    text: `
### No more hand-written reducers!

**xoid** is based on immutable updates.
You can "surgically" modify a subtree of the state by using \`select\` function, and changes will propagate to the root.

`,
    code: `import { create, select } from 'xoid'

const atom = create({ deeply: { nested: { foo: 5 } } })
const fooAtom = select(atom, (s) => s.deeply.nested.foo)

const oldValue = atom()
fooAtom(25) // set the value surgically into the store
const newValue = atom()

console.log(newValue) // { deeply: { nested: { foo: 25 } } }
assert(oldValue !== newValue) // ✅
`,
  },
  {
    text: `
### No-API Finite State Machines!
No additional syntax is required to define and use finite state machines. Just use the second argument of the callback as the state transition function.

`,
    code: `import { create } from 'xoid'

const red = { color: '#f00', onClick: () => machine(green) }
const green = { color: '#0f0', onClick: () => machine(red) }
const machine = create(red)

// in a React component
const { color, onClick } = useAtom(machine)
return <div style={{ color }} onClick={onClick}/>
`,
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
            src={useBaseUrl('img/logo.svg')}
            height="300px"
            style={{ margin: 'auto', boxShadow: '0px 2px 9px -3px #0000002e' }}
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
      {/* <NativeApps /> */}
      {codeBlocks.map((content, i) => (
        <NativeCode content={content} tint={!(i % 2)} />
      ))}
    </Layout>
  )
}

export default Index
