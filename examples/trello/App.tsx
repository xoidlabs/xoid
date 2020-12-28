import React from 'react'
import Board from './components/Board'
import rootStore from './store'

export default () => <Board store={rootStore.board} />
