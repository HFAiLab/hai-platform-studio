import React from 'react'
import type { AppContextType } from '../schema'
import { AppType } from '../schema'

export const AppContext = React.createContext<AppContextType>({
  appType: AppType.HAI_STUDIO,
})
