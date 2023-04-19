import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { HTMLInputProps, InputGroupProps2, NumericInputProps } from '@hai-ui/core'
import { InputGroup, NumericInput } from '@hai-ui/core'
import classNames from 'classnames'
import React from 'react'
import { AppToaster } from '../../utils'

export interface InputChecker {
  checker?: (value: string) => boolean
  showErrorTip?: boolean
}

export const InputGroupWithCheck = (props: InputGroupProps2 & InputChecker) => {
  // const [checkFailed, setCheckFailed] = useState(false);

  const computedProps = { ...props }

  if (props.onChange) {
    computedProps.onChange = (e) => {
      if (props.checker) {
        const checkRes = props.checker(e.target.value)
        if (!checkRes) {
          AppToaster.show({
            message: i18n.t(i18nKeys.biz_input_check_failed),
            intent: 'warning',
          })
          // setCheckFailed(true)
        } else {
          // setCheckFailed(false)
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          props.onChange && props.onChange(e)
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        props.onChange && props.onChange(e)
      }
    }
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <InputGroup className={classNames({ 'input-check-failed': false })} {...computedProps} />
}

export interface NumberInputChecker {
  checker?: (value: string | number) => boolean
  showErrorTip?: boolean
}

export const NumericInputWithCheck = (
  props: HTMLInputProps & NumericInputProps & NumberInputChecker,
): JSX.Element => {
  // const [checkFailed, setCheckFailed] = useState(false);

  const computedProps = { ...props }

  if (props.onValueChange) {
    computedProps.onValueChange = (value) => {
      if (props.checker) {
        const checkRes = props.checker(value)
        if (!checkRes) {
          AppToaster.show({
            message: i18n.t(i18nKeys.biz_input_check_failed),
            intent: 'warning',
          })
          // setCheckFailed(true)
        } else {
          // setCheckFailed(false)
          // @ts-expect-error because 这里二次封装的组件简化参数
          // eslint-disable-next-line no-lonely-if
          if (props.onValueChange) props.onValueChange(value)
        }
      } else {
        // @ts-expect-error because 这里二次封装的组件简化参数
        // eslint-disable-next-line no-lonely-if
        if (props.onValueChange) props.onValueChange(value)
      }
    }
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <NumericInput className={classNames({ 'input-check-failed': false })} {...computedProps} />
}
