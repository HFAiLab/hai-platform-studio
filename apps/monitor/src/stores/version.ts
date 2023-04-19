import { defineStore } from 'pinia'
import { AilabServerApiName, ailabServerClient } from '@/services'
import { logger, versionCompare } from '@/utils'
import { useAuthStore } from './auth'

interface VersionState {
  isChecking: boolean
  hasNewVersion: boolean
}

function getIsPrePub(): boolean {
  try {
    return !!import.meta.env.VITE_PREPUB && import.meta.env.VITE_PREPUB !== 'false'
  } catch (e) {
    return false
  }
}

const currentVersion = import.meta.env.VITE_SHORT_VERSION
const isPrePub = getIsPrePub()
const isDev = import.meta.env.VITE_BUILD_VERSION.startsWith('Dev.')

export const useVersionStore = defineStore('version', {
  state: (): VersionState => ({
    isChecking: false,
    hasNewVersion: false,
  }),

  actions: {
    async checkHasNewVersion() {
      if (isDev || this.isChecking) return
      this.isChecking = true
      try {
        const latestVersionResult = await ailabServerClient.request(
          AilabServerApiName.TRAININGS_GET_LATEST_APP_VERSION,
          {
            token: useAuthStore().token,
            app_name: 'monitor',
            base_app_version: isPrePub ? 'prepub' : 'online',
          },
        )
        logger.info(isPrePub, currentVersion, latestVersionResult.version)
        if (
          currentVersion &&
          latestVersionResult.version &&
          versionCompare(currentVersion, latestVersionResult.version)
        ) {
          this.hasNewVersion = true
        }
      } catch (e) {
        logger.error(e)
      }
      this.isChecking = false
    },
  },
})
