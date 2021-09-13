import React, { useEffect } from 'react'
import { create } from 'xoid'
import { useStore, useSetup } from '@xoid/react'

const TimerSetup = () => {
  const state = create(stopped)
  const time = create(0)
  let interval: ReturnType<typeof setTimeout>

  function stopped() {
    clearInterval(interval)
    time(0)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => state(playing),
      handleStop: () => {},
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
  const time = useStore(setup.time)
  const { playPauseButton, handlePlayPause, handleStop } = useStore(setup.state)

  return (
    <div>
      {time}
      <button onClick={handlePlayPause}>{playPauseButton}</button>
      <button onClick={handleStop}>stop</button>
    </div>
  )
}

export default () => <Stopwatch />
