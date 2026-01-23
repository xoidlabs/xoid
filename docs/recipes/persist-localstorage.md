---
id: persist-localstorage
title: Persisting data with localStorage
---

If the data is serializable, it's fairly simple.

```js
const getLocalStorage = (key) => 
  JSON.parse(localStorage.getItem(key))

const setLocalStorage = (key) => (state) => 
  localStorage.setItem(key, JSON.stringify(state))

// usage
const $foo = atom(getLocalStorage('foo') || initialState)
$foo.subscribe(setLocalStorage('foo'))
```