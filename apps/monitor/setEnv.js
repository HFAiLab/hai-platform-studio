const fs = require('fs')
const path = require('path')

const isPrepub = process.env.PREPUB ? 'true' : 'false'

function getShortVersion() {
  const raw = fs.readFileSync(path.join(__dirname, 'package.json'))
  return JSON.parse(raw).version
}
const pkgVersion = getShortVersion()

fs.appendFileSync('.env.local', `\nVITE_SHORT_VERSION = ${pkgVersion}\nVITE_PREPUB = ${isPrepub}`)
