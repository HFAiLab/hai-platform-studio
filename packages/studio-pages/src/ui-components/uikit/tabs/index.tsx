import React from 'react'

export const Tabs = (props: {
  items: Array<string>
  selected: string
  changeHandler: (newItem: string) => void
}): JSX.Element | null => {
  if (!props.items) {
    return null
  }
  const selected = props.selected || props.items[0]
  return (
    <ul
      className="hf-tabs"
      onClick={(e) => {
        const re = e.target as HTMLElement
        const v = re.dataset?.tab ?? null
        if (!v) {
          // do nothing
        } else {
          props.changeHandler(v)
        }
      }}
    >
      {props.items.map((item) => (
        <li data-tab={item} className={item === selected ? 'selected ptr' : 'ptr'}>
          {item}
        </li>
      ))}
    </ul>
  )
}
