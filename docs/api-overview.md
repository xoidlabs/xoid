---
id: api-overview
title: API Overview
---


| Package | Exports           | Description |
| - | - | - |
| Core | [`create`](api/create) , [`subscribe`](api/subscribe) , [`effect`](api/effect) , [`use`](api/use) | Primary exports |
| Helpers | [`select`](api/select) , [`lens`](api/lens) | Helpers (uses ES6 Proxy) |

### Other packages

| Package        | Exports           | Description |
| - | - | - |
| `@xoid/react`| [`useAtom`](api-react/useatom) , [`useSetup`](api-react/usesetup) | **React** integration |
| `@xoid/devtools` | [`devtools`](./recipes/redux-devtools-integration) | **Redux Devtools** integration |
