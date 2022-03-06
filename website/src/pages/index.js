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

\`use\` function, when used with a second argument, acts as a selector. 
The selected node will be a subscribable getter/setter object like any other atom. 
xoid is based on immutable updates, so if you "surgically" set state of a selected branch, changes will propagate to the root.



`,
    code: `import { create, use } from 'xoid'

const atom = create({ deeply: { nested: { foo: 5 } } })
const fooAtom = use(atom, (s) => s.deeply.nested.foo)

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
  style
}) {
  const El = element
  return <El className={`Section ${className} ${background}`} style={style}>{children}</El>
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
    <Section background="none" className="HeaderHero" style={{paddingTop: 110}}>
      {/* <GitHubStarButton /> */}
      <div className="titleContainer">
        <div className="title">
        <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="45 45 48 48"
      width={250}
      height={250}
    >
      <mask id="mask1">
        <path fill="#fff" d="M55.367 45.864H109.238V94.627H55.367z" />
        <path d="M73.37 51.3l28.061 28.381-9.521 9.317-28.112-28.335L73.37 51.3z" />
        <path
          d="M70.704 51.213l30.48 29.784-9.485 9.454-30.182-29.732 9.187-9.506z"
          transform="rotate(90 81.289 70.865)"
        />
      </mask>
      <g mask="url(#mask1)" transform="matrix(1, 0, 0, 1, -13.352717, -1.066109)">
        <path d="M 105.894 69.699 C 105.894 70.738 104.868 71.864 103.585 72.538 C 102.369 73.178 100.589 73.76 98.499 74.225 C 94.355 75.146 88.602 75.719 82.318 75.719 C 76.034 75.719 70.281 75.146 66.137 74.225 C 64.047 73.76 62.267 73.178 61.051 72.538 C 59.768 71.864 58.742 70.738 58.742 69.699 C 58.742 68.66 59.768 67.534 61.051 66.86 C 62.267 66.22 64.047 65.638 66.137 65.173 C 70.281 64.252 76.034 63.679 82.318 63.679 C 88.602 63.679 94.355 64.252 98.499 65.173 C 100.589 65.638 102.369 66.22 103.585 66.86 C 104.868 67.534 105.894 68.66 105.894 69.699 Z M 102.655 68.63 C 101.586 68.068 100.06 67.569 98.065 67.125 C 94.037 66.23 88.503 65.679 82.318 65.679 C 76.133 65.679 70.599 66.23 66.571 67.125 C 64.576 67.569 63.05 68.068 61.981 68.63 C 60.98 69.157 60.742 69.352 60.742 69.699 C 60.742 70.046 60.98 70.241 61.981 70.768 C 63.05 71.33 64.576 71.829 66.571 72.273 C 70.599 73.168 76.133 73.719 82.318 73.719 C 88.503 73.719 94.037 73.168 98.065 72.273 C 100.06 71.829 101.586 71.33 102.655 70.768 C 103.656 70.241 103.894 70.046 103.894 69.699 C 103.894 69.352 103.656 69.157 102.655 68.63 Z" style={{fill: '#ffffff50'}}></path>
        <path d="M 105.894 69.699 C 105.894 70.738 104.868 71.864 103.585 72.538 C 102.369 73.178 100.589 73.76 98.499 74.225 C 94.355 75.146 88.602 75.719 82.318 75.719 C 76.034 75.719 70.281 75.146 66.137 74.225 C 64.047 73.76 62.267 73.178 61.051 72.538 C 59.768 71.864 58.742 70.738 58.742 69.699 C 58.742 68.66 59.768 67.534 61.051 66.86 C 62.267 66.22 64.047 65.638 66.137 65.173 C 70.281 64.252 76.034 63.679 82.318 63.679 C 88.602 63.679 94.355 64.252 98.499 65.173 C 100.589 65.638 102.369 66.22 103.585 66.86 C 104.868 67.534 105.894 68.66 105.894 69.699 Z M 102.655 68.63 C 101.586 68.068 100.06 67.569 98.065 67.125 C 94.037 66.23 88.503 65.679 82.318 65.679 C 76.133 65.679 70.599 66.23 66.571 67.125 C 64.576 67.569 63.05 68.068 61.981 68.63 C 60.98 69.157 60.742 69.352 60.742 69.699 C 60.742 70.046 60.98 70.241 61.981 70.768 C 63.05 71.33 64.576 71.829 66.571 72.273 C 70.599 73.168 76.133 73.719 82.318 73.719 C 88.503 73.719 94.037 73.168 98.065 72.273 C 100.06 71.829 101.586 71.33 102.655 70.768 C 103.656 70.241 103.894 70.046 103.894 69.699 C 103.894 69.352 103.656 69.157 102.655 68.63 Z" style={{fill: '#ffffff50'}} transform="matrix(0, -1, 1, 0, 12.431485, 152.360825)"></path>
      </g>
      <path
        d="M84.654 76.539l-7.75-7.799 6.586-6.646a3.28 3.28 0 00-.006-4.609l-3.391-3.413a3.208 3.208 0 00-2.289-.952c-.865 0-1.677.338-2.286.952l-6.586 6.647-7.75-7.799a1.611 1.611 0 00-2.287 0l-5.665 5.717a1.638 1.638 0 00.003 2.305l7.75 7.798-7.728 7.799c-.303.306-.473.72-.472 1.153l.008 5.716c.001.901.726 1.63 1.619 1.63h5.674c.429 0 .84-.171 1.143-.477l7.728-7.799 7.75 7.799a1.61 1.61 0 002.287 0l5.665-5.717a1.633 1.633 0 00-.003-2.305zm-7.99-21.314a1.609 1.609 0 012.287 0l3.391 3.412c.63.634.632 1.671.003 2.305l-1.107 1.117-5.681-5.717 1.107-1.117zm-.051 4.482l1.285 1.292-19.047 19.22-1.284-1.292 19.046-19.22zm-22.238.082l5.666-5.717.838.844-1.823 1.84a.818.818 0 00.001 1.152.8.8 0 001.144 0l1.824-1.84 1.284 1.293-1.016 1.025a.818.818 0 00.574 1.391c.207 0 .414-.08.572-.239l1.016-1.025 1.284 1.292-1.823 1.84a.82.82 0 00.001 1.153.806.806 0 001.144 0l1.824-1.84.907.913-5.667 5.717-7.75-7.799zm20.04-2.295l1.053 1.06-19.046 19.22-1.053-1.06 19.046-19.22zM54.408 83.408l-.007-5.366 5.333 5.366h-5.326zm6.642-.977l-1.054-1.06 19.047-19.22 1.053 1.06-19.046 19.22zm16.797.977l-7.75-7.798 5.665-5.717.908.913-1.823 1.84a.81.81 0 00-.236.576c0 .209.079.418.237.577a.805.805 0 001.144 0l1.823-1.84 1.284 1.292-1.015 1.025a.81.81 0 00-.236.577c0 .208.079.417.237.576a.805.805 0 001.144 0l1.016-1.025 1.284 1.292-1.824 1.84a.816.816 0 00-.235.577c0 .208.079.417.237.576a.803.803 0 001.144 0l1.823-1.84.838.842-5.665 5.717z"
        fill="currentColor"
      />
    </svg>
        </div>
        <p className="tagline">
            Framework-agnostic state management for JavaScript
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
          xoid · Framework-agnostic state management for JavaScript
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
