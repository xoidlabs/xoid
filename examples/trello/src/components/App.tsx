import React from 'react'
import Board from './Board'
import rootStore from '../store'

export default () => <Board store={rootStore.board} />
