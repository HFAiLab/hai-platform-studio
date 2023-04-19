import React from 'react'
import type { ManagerServiceContextType } from '../schema'

// @ts-expect-error ignore null error
export const ManagerServiceContext = React.createContext<ManagerServiceContextType>(null)
