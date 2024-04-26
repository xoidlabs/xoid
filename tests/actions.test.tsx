import { atom } from 'xoid'
import { debug } from './testHelpers'

it('uses the actions in vanilla (interop)', async () => {
  const $atom = atom({ count: 0 }, (a) => ({
    inc: () => a.update((state) => ({ count: state.count + 1 })),
  }))
  $atom.actions.inc()
  expect(debug($atom)).toMatchSnapshot()
})

it('uses the actions in vanilla', async () => {
  const $atom = atom({ count: 0 }, (a) => ({
    inc: () => a.update((state) => ({ count: state.count + 1 })),
  }))
  $atom.actions.inc()
  expect(debug($atom)).toMatchSnapshot()
})
