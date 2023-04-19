export type ExtractProps<T, K> = T extends keyof K ? K[T] : never
