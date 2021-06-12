import React from 'react'
import create from 'xoid'
import { useStore } from '@xoid/react'

const timerMachine = () => {
  const store = create(stopped)
  const time = create(0)
  let interval: ReturnType<typeof setTimeout>

  function stopped() {
    clearInterval(interval)
    time(0)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => store(playing),
      handleStop: () => {},
    }
  }
  function playing() {
    interval = setInterval(() => time((i) => i + 1), 100)
    return {
      playPauseButton: 'pause',
      handlePlayPause: () => store(paused),
      handleStop: () => store(stopped),
    }
  }
  function paused() {
    clearInterval(interval)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => store(playing),
      handleStop: () => store(stopped),
    }
  }

  return create((get) => ({ ...get(store), time }))
}

const Stopwatch = () => {
  const { time, playPauseButton, handlePlayPause, handleStop } = useStore(
    timerMachine
  )

  return (
    <div>
      {time}
      <button onClick={handlePlayPause}>{playPauseButton}</button>
      <button onClick={handleStop}>stop</button>
    </div>
  )
}

export default () => <Stopwatch />
