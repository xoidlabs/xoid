import { create, arrayOf } from 'xoid'

export interface BoardPayload {
  title: string
  columns: ColumnPayload[]
}

export interface ColumnPayload {
  id: number
  title: string
  cards: CardPayload[]
}

export interface CardPayload {
  id: number
  title: string
}

export const BoardModel = ({ title, columns }: BoardPayload) =>
  create({
    title,
    columns: arrayOf(ColumnModel, columns),
  })

export const ColumnModel = ({ id, title, cards }: ColumnPayload) =>
  create({
    id,
    title,
    cards: arrayOf(CardModel, cards),
  })

export const CardModel = ({ id, title }: CardPayload) =>
  create({
    id,
    title,
  })
