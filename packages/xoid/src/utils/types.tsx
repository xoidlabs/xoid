declare const voidOnly: unique symbol
export type Destructor = () => void | { [voidOnly]: never }

export type Truthy<T> = Exclude<T, false | 0 | '' | null | undefined | void>
