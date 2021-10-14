---
id: api-overview
title: API Overview
---

Next section provides a full API introduction. In the following sections, parts of the API are documented in the following order.

Exports of `xoid` can be divided into 3 main sections.

| Section | Exports           | Description |
| - | - | - |
| Core API | [`create`](api/create) , [`subscribe`](api/subscribe) , [`effect`](api/effect) | Most commonly used, lower-level exports |
| Model API | [`model`](api/model) , [`arrayOf`](api/arrayof) , [`objectOf`](api/objectof) , [`use`](api/use) | "Usables" for a flux-like experience |
| Helper(s) | [`ready`](api/ready) | A helper function that's usually used with refs |

### Other packages

| Package        | Exports           | Description |
| - | - | - |
| `@xoid/react`| [`useStore`](api-react/usestore) , [`useSetup`](api-react/usesetup) | **React** integration |
| `@xoid/devtools` | [`devtools`](./recipes/redux-devtools-integration) | **Redux Devtools** integration |

> There are also `@xoid/core` and `@xoid/observable` intended for library authors.
