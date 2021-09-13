import React from 'react'
import styled from '@emotion/styled'
import { useStore } from 'xoid'
import Editable from './Editable'
import { CardModel } from '../models'

const Self = {
  Container: styled.div`
    position: relative;
    margin-bottom: 0.6rem;
    background-color: #fff;
    padding: 0.65rem 0.6rem;
    color: #4d4d4d;
    border-bottom: 0.1rem solid #ccc;
    border-radius: 0.3rem;
    cursor: pointer;
    overflow: hidden;
  `,
  Title: styled.div``,
  DeleteButton: styled.div`
    position: absolute;
    background: #ffffff;
    margin: 0.5rem;
    right: 0;
    top: 0;
    opacity: 0;
    &:hover {
      opacity: 1;
    }
  `,
}

const Card = (props: {
  store: ReturnType<typeof CardModel>
  removeCard: () => void
}) => {
  return (
    <Self.Container>
      <Self.Title>
        <Editable>{props.store.title}</Editable>
      </Self.Title>
      <Self.DeleteButton onClick={props.removeCard}>✕</Self.DeleteButton>
    </Self.Container>
  )
}

export default Card
