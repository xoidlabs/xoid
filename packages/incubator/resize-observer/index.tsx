const resizeObserverFeature = feature(() => {
  const $resizeObserverEntry = atom<ResizeObserverEntry>()
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) $resizeObserverEntry.set(entry)
  })
  return { resizeObserver, $resizeObserverEntry }
})

const ResizeObserverModel = (element) => {
  const { resizeObserver, $resizeObserverEntry } = inject(resizeObserverFeature)
  return atom.call({
    subscribe(listener) {
      resizeObserver.observe(element)
      const dispose = $resizeObserverEntry.subscribe((entry) => {
        if (entry.target === element) listener(entry)
      })
      return () => {
        resizeObserver.unobserve(element)
        dispose()
      }
    },
  })
}

ResizeObserverModel(myDiv).subscribe(() => {})
