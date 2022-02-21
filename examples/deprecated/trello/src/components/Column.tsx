import React, { useRef } from 'react'
import styled from '@emotion/styled'
import { use } from 'xoid'
import { useSlice } from '@xoid/react'
import { ColumnAtom } from '../models'
import Card from './Card'
import Editable from './Editable'

const Self = {
  name: 'Column',
  Container: styled.div`
    display: flex;
    flex-flow: column nowrap;
    padding: 0.6rem;
    background-color: #e2e4e6;
    max-height: calc(100vh - 5rem);
    border-radius: 0.3rem;
  `,
  Title: styled.div`
    margin-bottom: 0.6rem;
  `,
  List: styled.div`
    overflow: scroll;
  `,
  Button: styled.div`
    margin-top: 0.6rem;
    background: rgba(0, 0, 0, 0.07);
    padding: 0.4rem;
    border-radius: 0.3rem;
    cursor: pointer;
  `,
}

const Column = function (props: { atom: ColumnAtom }) {
  const $$cards = useSlice(props.atom, 'cards')

  const ref = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    const element = ref.current
    if (element) {
      setTimeout(() => element.scrollTo(0, element.scrollHeight))
    }
  }
  const onClick = () => {
    use(props.atom.cards).add({
      id: Math.random(),
      title: 'untitled',
    })
    scrollToBottom()
  }
  return (
    <Self.Container>
      <Self.Title>
        <Editable>{props.atom.title}</Editable>
      </Self.Title>
      <Self.List ref={ref}>
        {props.atom.cards.map((atom, key) => (
          <Card key={key} atom={atom} removeCard={() => use(props.atom.cards).remove(key)} />
        ))}
      </Self.List>
      <Self.Button onClick={onClick}>Add a card...</Self.Button>
    </Self.Container>
  )
}

export default React.memo(Column)
