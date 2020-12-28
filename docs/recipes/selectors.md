---
id: selectors
title: Selector patterns
---

### Using selectors (lenses) to work easily with reference IDs

```js
type RootPayload = {
  users: Record<string, { name: string }>
  androidUsers: string[]
  iOsUsers: string[]
}

const RootModel = (payload: RootPayload) =>
  create({
    users: objectOf((user) => create(user), payload.users),
    androidUsers: payload.androidUsers,
    iOsUsers: payload.iOsUsers,
  })

const rootStore = RootModel({
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
