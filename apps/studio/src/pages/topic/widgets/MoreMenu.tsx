import { Button, Menu, MenuItem } from '@hai-ui/core/lib/esm'
import { Popover2 } from '@hai-ui/popover2'
import React from 'react'

export type MenuItemProps = React.ComponentProps<typeof MenuItem>
export type XtopicMenuProps = MenuItemProps[]

export const XtopicMoreMenu = (p: { menuSettings: XtopicMenuProps; className?: string }) => {
  return (
    <Popover2
      minimal
      className={p.className}
      position="bottom-left"
      content={
        <Menu>
          {p.menuSettings.map((itemSetting) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <MenuItem {...itemSetting} key={itemSetting.text as string} />
          ))}
        </Menu>
      }
    >
      <Button small minimal icon="more" onClick={() => {}} />
    </Popover2>
  )
}
