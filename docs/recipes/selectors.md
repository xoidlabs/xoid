---
id: selectors
title: Selector patterns
---

### Using selectors to work with reference IDs

```js
type RootType = {
  users: Record<string, { name: string }>
  androidUsers: string[]
  iOsUsers: string[]
}

const rootStore = create<RootType>({
  users: {
    aaaa: { name: 'foo' },
    bbbb: { name: 'bar' },
    cccc: { name: 'baz' },
  },
  androidUsers: ['aaaa'],
  iOsUsers: ['bbbb', 'cccc'],
})

const androidUsersLens = create((get) => {
  const androidUsers = get(rootStore.androidUsers)
  const users = get(rootStore.users)
  return androidUsers.map((id) => users[id])
})

get(androidUsersLens[0].name) // 'foo'
```
