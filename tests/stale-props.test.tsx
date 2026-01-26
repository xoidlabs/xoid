import React from 'react'
import { act, render } from '@testing-library/react'
import { atom, Atom } from 'xoid'
import { useSetup } from '@xoid/react'

describe('useSetup stale props issue', () => {
  it('reproduces stale props issue in useSetup', async () => {
    let capturedDisabled: boolean | undefined

    function TestComponent({ disabled }: { disabled: boolean }) {
      const { checkDisabled } = useSetup(
        $p => {
          return {
            checkDisabled: () => {
              capturedDisabled = $p.value.disabled
            },
          }
        },
        { disabled }
      )

      // React.useLayoutEffect(() => {
      //   if (disabled) {
      //     checkDisabled()
      //   }
      // }, [disabled, checkDisabled])

      if (disabled && capturedDisabled === false) {
        checkDisabled()
      }

      return <button onClick={checkDisabled}>Click me</button>
    }

    const { getByText, rerender } = render(<TestComponent disabled={false} />)

    // Initial check
    act(() => {
      getByText('Click me').click()
    })
    expect(capturedDisabled).toBe(false)

    // Rerender with disabled=true
    act(() => {
      rerender(<TestComponent disabled={true} />)
    })

    // This is expected to FAIL if the issue exists (it will be false instead of true)
    // because useIsoLayoutEffect might not have updated the atom yet when the click happens,
    // OR because of how the atom is being updated.
    console.log('capturedDisabled after rerender (LayoutEffect):', capturedDisabled)
    expect(capturedDisabled).toBe(true)
  })

  it('verifies useAltSetup fixes the issue', async () => {
    let capturedDisabled: boolean | undefined

    function useAltSetup<T, U>(setup: ($: Atom<T>) => U, p: T): U {
      const $ = React.useMemo(() => atom(p), [])
      // React.useEffect(() => $.set(p), [p]);
      $.set(p) // Update during render
      return React.useMemo(() => setup($), [])
    }

    function TestComponent({ disabled }: { disabled: boolean }) {
      const { checkDisabled } = useAltSetup(
        $p => {
          return {
            checkDisabled: () => {
              capturedDisabled = $p.value.disabled
            },
          }
        },
        { disabled }
      )

      if (disabled && (capturedDisabled === false || capturedDisabled === undefined)) {
        checkDisabled()
      }

      return <button onClick={checkDisabled}>Click me</button>
    }

    const { getByText, rerender } = render(<TestComponent disabled={false} />)

    // Initial check
    act(() => {
      getByText('Click me').click()
    })
    expect(capturedDisabled).toBe(false)

    // Rerender with disabled=true
    act(() => {
      rerender(<TestComponent disabled={true} />)
    })

    expect(capturedDisabled).toBe(true)
  })
})
