---
id: persist-localstorage
title: Persisting data with localStorage
---

If the data is serializable, it's fairly simple.

```js
const getLocalStorage = () => 
  JSON.parse(localStorage.getItem('foo'))

const setLocalStorage = (state) => 
  localStorage.setItem('foo', JSON.stringify(state))

// usage
const atom = create(getLocalStorage('foo') || initialState)
effect(atom, setLocalStorage('foo'))
```