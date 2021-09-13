import React, { useEffect, useRef, useState } from 'react'
import { create, effect, Observable } from 'xoid'
import { useSetup, useStore } from '@xoid/react'

export default (props: { children: Observable<string> }) => {
  const [isEditable, setEditable] = useSetup(false)
  const title = useStore(props.children)
  const setTitle = props.children
  const ref = useRef<HTMLDivElement>()

  return (
    <div
      ref={ref}
      contentEditable={isEditable}
      suppressContentEditableWarning={isEditable}
      onClick={() => {
        setEditable(true);
        setTimeout(() => {
          ref.current?.focus();
        });
      }}
      onFocus={() => ref.current && selectAllText(ref.current)}
      onBlur={() => {
        setTitle(ref.current?.textContent || title)
        setEditable(false)
      }}>
      {title}
    </div>
  )
}

const xxx = (props: { children: Observable<string> }) => {
  const { $title, $isEditable, ref } = useSetup((deps) => {
    const $isEditable = create(false)
    effect($isEditable, ready(ref).contentEditable)
    effect(deps.title, ready(ref).textContent)
    const ref = create<HTMLDivElement>()

    return { $title, $isEditable, ref }
  }, props)

  const title = useStore($title)

  return (
    <div
      ref={ref}
      onClick={() => {
        $isEditable(true);
        setTimeout(() => {
          ref()?.focus();
        });
      }}
      onFocus={() => ref() && selectAllText(ref())}
      onBlur={() => {
        $title(ready(ref).textContent() || title)
        $isEditable(false)
      }}>
      {title}
    </div>
  )
}

const selectAllText = (div: HTMLDivElement) => {
  const range = document.createRange()
  range.selectNodeContents(div)
  const sel = window.getSelection()
  if (sel) {
    sel.removeAllRanges()
    sel.addRange(range)
  }
}
