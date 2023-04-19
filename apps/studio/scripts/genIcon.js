const fs = require('fs')
const path = require('path')
const { pascalCase } = require('change-case')

function genIcon() {
  console.info('[local] begin gen icon code...')

  const rawIconPaths = require('@hai-ui/icons/lib/cjs/iconSvgPaths')

  const { IconSvgPaths16 } = rawIconPaths
  const { IconSvgPaths20 } = rawIconPaths

  const { usedHFUIIcon } = require('../src/svgReplace/config')

  const newIconSvgPaths16 = {}
  const newIconSvgPaths20 = {}

  for (const iconKey of usedHFUIIcon) {
    newIconSvgPaths16[pascalCase(iconKey)] = IconSvgPaths16[pascalCase(iconKey)]
    newIconSvgPaths20[pascalCase(iconKey)] = IconSvgPaths20[pascalCase(iconKey)]
  }

  const resScripts = `// @ts-nocheck
// 此文件是生成文件，不需要检查 eslint
/* eslint-disable */
import { pascalCase } from "change-case";

export const IconSvgPaths16 = ${JSON.stringify(newIconSvgPaths16, null, 4)};

export const IconSvgPaths20 = ${JSON.stringify(newIconSvgPaths20, null, 4)};

// hint: 这个是我们生成的文件，源文件在 hf_web_ui/packages/icons/src/iconSvgPaths.ts，为了避免更多引入，直接 any 了
export function iconNameToPathsRecordKey(name) {
    return pascalCase(name);
}
`

  fs.writeFileSync(path.join(__dirname, '../src/svgReplace/iconSvgReplacePath.js'), resScripts)

  console.info('[local] gen icon code success')
}

genIcon()
