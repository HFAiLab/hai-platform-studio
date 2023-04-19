/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
// 监听 less 变化并且及时编译
const fs = require('fs')
const path = require('path')
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs')
const child_process = require('child_process')
const CWD = path.join(__dirname, '../')
const themesDir = path.join(__dirname, '../src/style/themes')
const styleDir = path.join(__dirname, '../src/style/entries')
const themesDistDir = path.join(__dirname, '../dist/style/themes')
const { argv } = yargs(hideBin(process.argv))

function runShellSync(cmd, config) {
  console.info(`[CMD] ${cmd}`)
  child_process.execSync(cmd, {
    stdio: 'inherit',
    ...config,
  })
}

const ailabThemesDir = path.join(
  __dirname,
  '../../../apps/studio/public/vditor@3.8.17/dist/css/content-theme',
)

function buildAndOptionalListen() {
  const buildThemes = () => {
    console.info('theme change, rebuild')
    runShellSync(`pnpm run build:less-theme`, {
      cwd: CWD,
    })
    runShellSync(`cp -rf ${themesDistDir}/* ${ailabThemesDir}`)
  }

  fs.watch(themesDir, buildThemes)

  const buildStyle = () => {
    console.info('style change, rebuild')
    runShellSync(`pnpm run build:less-index`, {
      cwd: CWD,
    })
  }

  const { watch } = argv

  // 预先构建以此
  buildThemes()
  buildStyle()

  if (watch) {
    fs.watch(themesDir, buildStyle)
    fs.watch(styleDir, buildStyle)
  } else {
    process.exit(0)
  }
}

buildAndOptionalListen()
