import React from 'react'
import { create, set, useStore } from 'xoid'

const timerMachine = create((get, transition) => {
  let interval: ReturnType<typeof setTimeout>
  const time = create(0)

  function stopped() {
    clearInterval(interval)
    set(time, 0)
    return {
      time,
      playPauseButton: 'play',
      handlePlayPause: () => transition(playing),
      handleStop: () => {},
    }
  }
  function playing() {
    interval = setInterval(() => set(time, (i) => i + 1), 100)
    return {
      time,
      playPauseButton: 'pause',
      handlePlayPause: () => transition(paused),
      handleStop: () => transition(stopped),
    }
  }
  function paused() {
    clearInterval(interval)
    return {
      time,
      playPauseButton: 'play',
      handlePlayPause: () => transition(playing),
      handleStop: () => transition(stopped),
    }
  }

  return stopped()
})

const Stopwatch = () => {
  const [{ time, playPauseButton, handlePlayPause, handleStop }] = useStore(
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
