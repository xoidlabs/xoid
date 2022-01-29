import React from 'react'
import { create } from 'xoid'
import { useAtom, useSetup } from '@xoid/react'

const TimerSetup = () => {
  let interval: ReturnType<typeof setTimeout>
  const time = create(0)
  const state = create(stopped)

  function stopped() {
    clearInterval(interval)
    time(0)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => state(playing),
      handleStop: () => state(stopped),
    }
  }
  function playing() {
    interval = setInterval(() => time((i) => i + 1), 100)
    return {
      playPauseButton: 'pause',
      handlePlayPause: () => state(paused),
      handleStop: () => state(stopped),
    }
  }
  function paused() {
    clearInterval(interval)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => state(playing),
      handleStop: () => state(stopped),
    }
  }

  return { time, state }
}

const Stopwatch = () => {
  const setup = useSetup(TimerSetup)
  const time = useAtom(setup.time)
  const { playPauseButton, handlePlayPause, handleStop } = useAtom(setup.state)

  return (
    <div>
      {time}
      <button onClick={handlePlayPause}>{playPauseButton}</button>
      <button onClick={handleStop}>stop</button>
    </div>
  )
}

const App = () => <Stopwatch />
export default App
