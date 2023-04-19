import { Button } from '@hai-ui/core/lib/esm'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { HFPageLayout } from '../../components/HFLayout'
import { HFPanel } from '../../components/HFPanel'

import './index.scss'

export const NotFound404 = () => {
  return (
    <div>
      <HFPageLayout responsive>
        <HFPanel className="hfai-404-container" disableLoading>
          <h2>404</h2>
          <p>你访问的页面不存在，可能已经被删除</p>
          <NavLink
            className="hfai-nav-item"
            // eslint-disable-next-line react/no-children-prop
            children={(cprops) => {
              return <Button outlined active={cprops.isActive} text="回到主页" />
            }}
            to="/"
          />
        </HFPanel>
      </HFPageLayout>
    </div>
  )
}
