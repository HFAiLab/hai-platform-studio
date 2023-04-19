/* eslint-disable */

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import fs from 'fs'
import pkgJson from './package.json' assert { type: 'json' }

const { argv } = yargs(hideBin(process.argv))
const { CI_COMMIT_SHORT_SHA } = process.env

function getShortVersion() {
  const pkgVersion = pkgJson.version
  const shortVersion = pkgVersion.split('-')[1].split('.')[1]
  return shortVersion
}

fs.writeFileSync(
  '.env',
  `VITE_SHORT_VERSION = ${getShortVersion()}\nVITE_PRODUCTION = ${!!argv.production} \nVITE_PREPUB = ${!!argv.prepub} \nVITE_APP_VERSION = ${CI_COMMIT_SHORT_SHA}`,
)
