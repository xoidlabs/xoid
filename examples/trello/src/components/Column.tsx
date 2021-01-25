import React, { useRef } from 'react'
import styled from '@emotion/styled'
import { use, useStore } from 'xoid'
import { ColumnModel } from '../models'
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

const Column = function (props: { store: ReturnType<typeof ColumnModel> }) {
  useStore(props.store.cards)

  const ref = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    const element = ref.current
    if (element) {
      setTimeout(() => element.scrollTo(0, element.scrollHeight))
    }
  }
  const onClick = () => {
    use(props.store.cards).add({
      id: Math.random(),
      title: 'untitled',
    })
    scrollToBottom()
  }
  return (
    <Self.Container>
      <Self.Title>
        <Editable>{props.store.title}</Editable>
      </Self.Title>
      <Self.List ref={ref}>
        {props.store.cards.map((store, key) => (
          <Card
            key={key}
            store={store}
            removeCard={() => use(props.store.cards).remove(key)}
          />
        ))}
      </Self.List>
      <Self.Button onClick={onClick}>Add a card...</Self.Button>
    </Self.Container>
  )
}

export default React.memo(Column)
