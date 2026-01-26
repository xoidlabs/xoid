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

    // This is expected to FAIL if the issue was not fixed
    expect(capturedDisabled).toBe(true)
  })

  it('verifies useAltSetup fixes the issue', async () => {
    let capturedDisabled: boolean | undefined

    function useAltSetup<T, U>(setup: ($: Atom<T>) => U, p: T): U {
      const $ = React.useMemo(() => atom(p), [])
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

  it('reproduces the specific issue reported by the user', async () => {
    let capturedDisabledInsideCallback: boolean | undefined

    function Child({ onValue, disabled }: { onValue: (v: number) => void; disabled: boolean }) {
      if (disabled) {
        onValue(10)
      }
      return null
    }

    function TestComponent({
      disabled,
      onChange,
    }: {
      disabled: boolean
      onChange: (v: number) => void
    }) {
      const { onValue } = useSetup(
        $p => {
          return {
            onValue: (v: number) => {
              capturedDisabledInsideCallback = $p.value.disabled
              if (!$p.value.disabled) {
                $p.value.onChange(v)
              }
            },
          }
        },
        { disabled, onChange }
      )

      return <Child onValue={onValue} disabled={disabled} />
    }

    const onChange = (v: number) => {}

    const { rerender } = render(<TestComponent disabled={false} onChange={onChange} />)

    // Rerender with disabled=true. Child will call onValue(10) during render.
    act(() => {
      rerender(<TestComponent disabled={true} onChange={onChange} />)
    })

    expect(capturedDisabledInsideCallback).toBe(true)
  })

  it('reproduces the reporter specific snippet and distinguishes between atom and closure variable', async () => {
    let capturedAtomDisabled: boolean | undefined
    let capturedClosureDisabled: boolean | undefined

    function TestComponent({ disabled }: { disabled: boolean }) {
      const { check } = useSetup(
        ($p => {
          // This 'p' is captured from the first render
          const p = $p.value
          return {
            check: () => {
              capturedAtomDisabled = $p.value.disabled
              capturedClosureDisabled = p.disabled
            },
          }
        }) as any,
        { disabled }
      )

      if (disabled && capturedAtomDisabled === undefined) {
        check()
      }

      return null
    }

    const { rerender } = render(<TestComponent disabled={false} />)

    // Rerender with disabled=true
    act(() => {
      rerender(<TestComponent disabled={true} />)
    })

    expect(capturedAtomDisabled).toBe(true)
    expect(capturedClosureDisabled).toBe(false)
  })
})
