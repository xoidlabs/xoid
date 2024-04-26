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
const atom = atom(getLocalStorage('foo') || initialState)
atom.subscribe(setLocalStorage('foo'))
```