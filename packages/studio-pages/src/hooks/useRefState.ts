import { useCallback, useRef, useState } from 'react'

export const useRefState = <T>(initValue: T): [T, { current: T }, (value: T) => void] => {
  const [value, setValue] = useState(initValue)
  const valueRef = useRef(value)
  const updateValue = useCallback((nextValue: T): void => {
    setValue(nextValue)
    valueRef.current = nextValue
  }, [])
  return [value, valueRef, updateValue]
}
