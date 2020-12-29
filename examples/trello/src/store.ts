import { create } from 'xoid'
import { BoardModel } from './models'
import data from './data.json'

const rootStore = create({
  board: BoardModel(data),
})

export default rootStore
