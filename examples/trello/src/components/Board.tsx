import React from 'react'
import styled from '@emotion/styled'
import { use, useStore } from 'xoid'
import { BoardStore, CardPayload } from '../models'
import Column from './Column'
import Editable from './Editable'

const Self = {
  Container: styled.div`
    background: #0079bf;
  `,
  Title: styled.div`
    padding-top: 0.8rem;
    padding-bottom: 0;
    padding-left: 1.6rem;
    color: #ffffff;
  `,
  List: styled.div`
    display: grid;
    grid-auto-columns: 18rem;
    grid-auto-flow: column;
    grid-column-gap: 0.8rem;
    padding: 0.8rem;
    align-items: start;
    overflow-x: auto;
    height: 100vh;
  `,
  Button: styled.div`
    background: rgba(0, 0, 0, 0.07);
    padding: 0.4rem;
    border-radius: 0.3rem;
    cursor: pointer;
  `,
}

const Board = (props: { store: BoardStore }) => {
  useStore(props.store.columns)
  return (
    <Self.Container>
      <Self.Title>
        <Editable>{props.store.title}</Editable>
      </Self.Title>
      <Self.List>
        {props.store.columns.map((store, key) => (
          <Column key={key} store={store} />
        ))}
        <Self.Button
          onClick={() =>
            use(props.store.columns).add({
              id: Math.random(),
              title: 'undef',
              cards: [],
            })
          }>
          Add a list...
        </Self.Button>
      </Self.List>
    </Self.Container>
  )
}

export default React.memo(Board)
