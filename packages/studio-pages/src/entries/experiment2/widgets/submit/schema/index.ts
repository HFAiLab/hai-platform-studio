import type { Exp2CreateParams } from '../../../schema/params'

export interface SubmitCommonInputProps {
  isLock: boolean
  isLoading: boolean
  onChange: <T extends keyof Exp2CreateParams>(content: {
    type: T
    value: Exp2CreateParams[T]
  }) => void
}
