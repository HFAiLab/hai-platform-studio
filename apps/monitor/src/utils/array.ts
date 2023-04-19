export const range = (start: number, end: number): number[] => {
  const result = []

  for (let i = start; i < end; i += 1) {
    result.push(i)
  }

  return result
}
