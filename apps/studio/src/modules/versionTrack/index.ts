import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import dayjs from 'dayjs'
import { APPShortVersion, APPVersion } from '../../utils'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'

class VersionTrack {
  lastReportDate: string | null = null

  reportIntervalId: number | null = null

  /**
   * 每日的 7-8 点，把用的版本上报到 countly
   */
  reportVersionTrack = () => {
    if (this.reportIntervalId) {
      clearInterval(this.reportIntervalId)
    }

    this.reportIntervalId = window.setInterval(() => {
      const currentDate = new Date()
      if (currentDate.getHours() >= 7) {
        const currentDateStr = dayjs(currentDate).format('YYYY-MM-DD')
        if (currentDateStr === this.lastReportDate) return

        this.lastReportDate = currentDateStr
        AilabCountly.safeReport(CountlyEventKey.appVersionTrack, {
          segmentation: {
            appShortVersion: APPShortVersion,
            appVersion: APPVersion,
            visibilityState: document.visibilityState,
            currentDateStr,
          },
        })
      }
    }, ONEHOUR / 2)
  }
}

export const GlobalVersionTrack = new VersionTrack()
