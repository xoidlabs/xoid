import React, { useEffect, useRef, useState } from 'react'
import { useStore, Value } from 'xoid'

export default (props: { children: Value<string> }) => {
  const [isEditable, setEditable] = useState(false)
  const [title, setTitle] = useStore(props.children)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  })
  return isEditable ? (
    <div
      ref={ref}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onFocus={() => ref.current && selectAllText(ref.current)}
      onBlur={() => {
        setTitle(ref.current?.textContent || title)
        setEditable(false)
      }}>
      {title}
    </div>
  ) : (
    <div onClick={() => setEditable(true)}>{title.trim() || 'untitled'}</div>
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
