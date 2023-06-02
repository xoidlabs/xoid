import { create } from 'xoid'
import { debug } from './testHelpers'

it('uses the actions in vanilla (interop)', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom.update((state) => ({ count: state.count + 1 })),
  }))
  atom.actions.inc()
  expect(debug(atom)).toMatchSnapshot()
})

it('uses the actions in vanilla', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom.update((state) => ({ count: state.count + 1 })),
  }))
  atom.actions.inc()
  expect(debug(atom)).toMatchSnapshot()
})
