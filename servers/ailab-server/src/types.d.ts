export type Merge<F, S> = {
  [k in keyof F | keyof S]: k extends keyof S ? S[k] : k extends keyof F ? F[k] : never
}
