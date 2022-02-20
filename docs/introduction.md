---
id: getting-started
title: Getting Started
---

> **xoid** is a scalable state management library with a small API surface.
> While learning it takes ~5 minutes, you can still manage great complexity with it.


## Installation

The **xoid** package lives in <a href="https://www.npmjs.com/get-npm" target="_blank">npm</a>. To install, you can run one of the the following commands:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'deno', value: 'deno'},
  ]}>
  <TabItem value="npm">

```bash
npm install xoid
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn add xoid
```

  </TabItem>
  <TabItem value="deno">

```js
import { create } from 'https://unpkg.com/xoid/index.js'
```

  </TabItem>
</Tabs>

If you're using **xoid** with React, also install the **@xoid/react** package.

## Resources

- If you're new to **xoid**, we recommend starting with the [quick tutorial in the next section](quick-tutorial).
- In [Examples](examples) section, you'll find examples to run on Codesandbox.
- You can refer to [Recipes](./recipes/using-context-correctly) section for more advanced stuff.
