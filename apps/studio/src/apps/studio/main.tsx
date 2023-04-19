import 'core-js/es/array/at'

import { i18n } from '@hai-platform/i18n'
import HFLogger from '@hai-platform/logger'
import React from 'react'
import ReactDOM from 'react-dom'
import '../../modules/user'
import { LevelLogger } from '../../utils'
import { getCurrentLanguage } from '../../utils/lan'
import { initTheme } from '../../utils/theme'
import App from './App'
import { AppContext } from './context/context'
import type { AppContextType } from './schema'
import { AppType } from './schema'

import '../../index.scss'

window.HFLogger = HFLogger
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
;(document.getElementById('default-loading-tip')! as HTMLParagraphElement).innerHTML =
  '[2/3] Begin Rendering'

HFLogger.initConfig({
  dbName: 'HFAILabWebLog',
  errorHandler: (e: any) => {
    /* eslint-disable-next-line */
    console.error('HFLogger internal error: e', e)
  },
})

initTheme()
i18n.setLanguage(getCurrentLanguage())

LevelLogger.info('\n==>start studio!')

// eslint-disable-next-line react/jsx-no-constructed-context-values
const contextValue: AppContextType = {
  appType: AppType.STUDIO,
}

ReactDOM.render(
  <React.StrictMode>
    <AppContext.Provider value={contextValue}>
      <App />
    </AppContext.Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
