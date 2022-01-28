---
id: getting-started
title: Getting Started
---

> **xoid** is a scalable state management library with a small API surface.
> While learning it takes ~10 mins, you can still manage great complexity with it.


## Installation

The **xoid** package lives in <a href="https://www.npmjs.com/get-npm" target="_blank">npm</a>. To install, run the following command:

```shell
npm install xoid
```

Or if you're using <a href="https://classic.yarnpkg.com/en/docs/install/" target="_blank">yarn</a>:

```shell
yarn add xoid
```

## API Overview

Next section provides a full API introduction. In the following sections, parts of the API are documented in the following order.

Exports of `xoid` can be divided into 2 main sections.

| Package | Exports           | Description |
| - | - | - |
| Core | [`create`](api/create) , [`subscribe`](api/subscribe) , [`effect`](api/effect) , [`use`](api/use) | Primary exports |
| Helpers | [`select`](api/select) , [`lens`](api/lens) | Helpers (uses ES6 Proxy) |

### Other packages

| Package        | Exports           | Description |
| - | - | - |
| `@xoid/react`| [`useAtom`](api-react/useatom) , [`useSetup`](api-react/usesetup) | **React** integration |
| `@xoid/devtools` | [`devtools`](./recipes/redux-devtools-integration) | **Redux Devtools** integration |
