export type Merge<T, U> = {
  [P in Exclude<keyof T, keyof U>]: T[P]
} & {
  [G in keyof U]: U[G]
}

// 相比于 A & B 这种方式，提示更加清晰
// FIX: 但目前是有一个问题的，? 会变成 undefined
export type Merge3<T, U, F> = Merge<Merge<T, U>, F>
