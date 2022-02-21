import { model, arrayOf } from '@xoid/utils'

export interface BoardType {
  title: string
  columns: ColumnType[]
}

export interface ColumnType {
  id: number
  title: string
  cards: CardType[]
}

export interface CardType {
  id: number
  title: string
}

export const CardModel = model<CardType>()

export const ColumnModel = model<ColumnType>({
  cards: arrayOf(CardModel),
})

export const BoardModel = model<BoardType>({
  columns: arrayOf(ColumnModel),
})
