---
id: api-overview
title: API Overview
---

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
