import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { prefill } from '@xoid/prefill'

afterEach(cleanup)

describe('prefill', () => {
  it('should prefill props for an intrinsic element', () => {
    const BlueDiv = prefill('div', { style: { color: 'blue' } })
    const { getByText } = render(<BlueDiv>Hello</BlueDiv>)
    const element = getByText('Hello')
    expect(element.style.color).toBe('blue')
  })

  it('should merge classNames by default', () => {
    const RedDiv = prefill('div', { className: 'red' })
    const { getByText } = render(<RedDiv className="bold">Hello</RedDiv>)
    const element = getByText('Hello')
    expect(element.className).toBe('red bold')
  })

  it('should allow overriding prefilled props', () => {
    const BlueDiv = prefill('div', { style: { color: 'blue' } })
    const { getByText } = render(<BlueDiv style={{ color: 'red' }}>Hello</BlueDiv>)
    const element = getByText('Hello')
    // Now that stylePlugin is implemented, styles should be merged.
    // The prop style { color: 'red' } should merge with prefilled { color: 'blue' }.
    expect(element.style.color).toBe('red')
  })

  it('should merge style objects', () => {
    const BlueDiv = prefill('div', { style: { color: 'blue', fontSize: '20px' } })
    const { getByText } = render(<BlueDiv style={{ color: 'red', fontWeight: 'bold' }}>Hello</BlueDiv>)
    const element = getByText('Hello')
    expect(element.style.color).toBe('red')
    expect(element.style.fontSize).toBe('20px')
    expect(element.style.fontWeight).toBe('bold')
  })

  it('should support functional options for dynamic props', () => {
    const DynamicDiv = prefill('div', (props: { isRed: boolean }) => ({
      style: { color: props.isRed ? 'red' : 'blue' },
    }))

    const { getByText, rerender } = render(<DynamicDiv isRed={true}>Hello</DynamicDiv>)
    expect(getByText('Hello').style.color).toBe('red')

    rerender(<DynamicDiv isRed={false}>Hello</DynamicDiv>)
    expect(getByText('Hello').style.color).toBe('blue')
  })

  it('should omit props used in functional options from being passed down', () => {
    const MyComponent = jest.fn((props: any) => <div {...props} />)
    const Prefilled = prefill(MyComponent, (props: { internal: string }) => ({
      title: props.internal,
    }))

    render(<Prefilled internal="foo" other="bar" />)
    
    expect(MyComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'foo',
        other: 'bar',
      })
    )
    
    // 'internal' should NOT be in the props passed to MyComponent
    const calledProps = MyComponent.mock.calls[0][0]
    expect(calledProps.internal).toBeUndefined()
  })

  it('should support custom plugin via `this` context', () => {
    const customPlugin = jest.fn((options, props) => {
      options.title = `Custom: ${props.name}`
    })
    
    const Prefilled = prefill.call(customPlugin, 'div', {})
    const { getByRole } = render(<Prefilled name="World" role="button" />)
    
    const element = getByRole('button')
    expect(element.getAttribute('title')).toBe('Custom: World')
    expect(customPlugin).toHaveBeenCalled()
  })

  it('should forward refs', () => {
    const Prefilled = prefill('input', { type: 'text' })
    const ref = React.createRef<HTMLInputElement>()
    render(<Prefilled ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle non-intrinsic elements correctly', () => {
    const Inner = ({ label, ...props }: any) => <button {...props}>{label}</button>
    const Prefilled = prefill(Inner, { label: 'Click me' })
    const { getByText } = render(<Prefilled />)
    expect(getByText('Click me').tagName).toBe('BUTTON')
  })
})
