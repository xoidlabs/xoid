import React from 'react'
import { create } from 'xoid'
import { useAtom, useSetup } from '@xoid/react'

const TimerSetup = () => {
  let interval: ReturnType<typeof setTimeout>
  const $time = create(0)
  const $state = create(stopped)

  function stopped() {
    clearInterval(interval)
    $time.set(0)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => $state.update(playing),
      handleStop: () => $state.update(stopped),
    }
  }
  function playing() {
    interval = setInterval(() => $time.update((i) => i + 1), 100)
    return {
      playPauseButton: 'pause',
      handlePlayPause: () => $state.update(paused),
      handleStop: () => $state.update(stopped),
    }
  }
  function paused() {
    clearInterval(interval)
    return {
      playPauseButton: 'play',
      handlePlayPause: () => $state.update(playing),
      handleStop: () => $state.update(stopped),
    }
  }

  return { $time, $state }
}

const Stopwatch = () => {
  const { $time, $state } = useSetup(TimerSetup)
  const time = useAtom($time)
  const { playPauseButton, handlePlayPause, handleStop } = useAtom($state)

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
