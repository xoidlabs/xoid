# `prefill`: Partial Application for React Components

A tiny utility for **preconfiguring React components** by “prefilling” (partially applying) props.

- Works with **intrinsic elements** (`'div'`, `'button'`, …) and **function components**
- **Forwards refs** automatically
- **Merges `className`** (default behavior)
- Advanced mode: When the second argument is a function instead of an object, it can be used to compose props *before* they reach a component, to rename or filter them.

See the release article [here](https://xoid.dev/blog/introducing-prefill).

---

## Install

```bash
npm i @xoid/prefill
```

`react` must be available in your project (this package expects React as a peer-dependency).

---

## Basic usage (object options)

Prefill some props and get a new component where those props become optional.

```ts
import { prefill } from '@xoid/prefill'

const OutlinedButton = prefill('button', { className: 'btn btn-outlined' })

// `type` is now optional for consumers
;(() => <OutlinedButton className="my-extra" />)()
```

### With an existing component

```ts
import { prefill } from '@xoid/prefill'
import { Button } from './Button'

const PrimaryButton = prefill(Button, { variant: 'primary' })
```

---

## Function options (extras → pass-down) + prop filtering

When the second argument is a function, it receives a **proxy** of the incoming props.

**Any prop you read inside that function is treated as “extra” and will NOT be passed down** to the underlying element/component.

This makes it easy to:
- create custom props without leaking them to the DOM
- adapt/rename props
- compute pass-down props based on extras

```ts
import { prefill } from '@xoid/prefill'

type InputExtras = { onValueChange: (value: string) => void }

const Input = prefill('input', (props: InputExtras) => ({
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => props.onValueChange(e.target.value),
}))

// `onValueChange` is used to create `onChange`, and is NOT passed to <input/>
;(() => <Input onValueChange={(v) => console.log(v)} />)()
```

### Filtering rule (exactly)

- If `options` is an **object**: nothing is filtered.
- If `options` is a **function**: props accessed inside it are removed from the props that get passed down.

---

## `className` merging

By default, if both prefilled options and incoming props provide `className`, they are concatenated:

```ts
const Box = prefill('div', { className: 'base' })
;(() => <Box className="extra" />)() // final className: "base extra"
```

---

## Refs

The returned component is `React.forwardRef(...)` and will pass the ref down as `ref`.

```ts
const Input = prefill('input', { className: 'field' })

function Example() {
  const ref = React.useRef<HTMLInputElement>(null)
  return <Input ref={ref} />
}
```

---

## API

### `prefill(as, options)`

- **`as`**: an intrinsic element key (like `'div'`, `'input'`) or a React component.
- **`options`**:
  - an object of prefilled props, or
  - a function `(extras) => passDownProps` (see “Function options” above)

Named + default export are both provided:

```ts
import prefill, { prefill as namedPrefill } from '@xoid/prefill'
```

---

## Advanced: custom merge “plugin”

Internally, `prefill` calls a “plugin” function to post-process/merge props. By default it only merges `className`.

You can provide your own plugin by calling `prefill` with a custom `this`:

```ts
import { prefill } from '@xoid/prefill'

const mergeStyle = (left: { style?: React.CSSProperties }, right: { style?: React.CSSProperties }) => {
  if (left.style && right.style) right.style = { ...left.style, ...right.style }
}

const styled = prefill.bind(mergeStyle)

const Box = styled('div', { style: { padding: 8 } })
;(() => <Box style={{ color: 'tomato' }} />)() // style => { padding: 8, color: 'tomato' }
```

Your plugin is called as:

```ts
(nextOptions, nextProps) => void
```

and may mutate `nextProps` (e.g. to merge `className`, `style`, event handlers, etc.).
