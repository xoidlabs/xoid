declare const voidOnly: unique symbol
export type Destructor = () => void | { [voidOnly]: never }
