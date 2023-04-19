/*
 * Copyright 2019 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { sassSvgInlinerFactory } from '@hai-ui/node-build-scripts'

console.info('sass custom function load...', process.cwd())

const inliner = sassSvgInlinerFactory(`${process.cwd()}/resources/icons`, {
  // run through SVGO first
  optimize: true,
  // minimal "uri" encoding is smaller than base64
  encodingFormat: 'uri',
})
export default {
  /**
   * Sass function to inline a UI icon svg and change its path color.
   *
   * Usage:
   * svg-icon("16px/icon-name.svg", (path: (fill: $color)) )
   */

  /**
   * HINT: 20230302
   * 由于目前版本 vite 使用 sass 旧的 render 接口来渲染，
   * LegacyOptions 传入的自定义函数 async function 并不能直接写成 promise 形式。
   * 详情见
   * https://sass-lang.com/documentation/js-api/modules#render
   * https://sass-lang.com/documentation/js-api/modules#LegacyAsyncFunction
   * 而且此处有 dart-sass 的参数兼容问题，需要再包装一层传给 Blueprint UI 的 sassSvgInlinerFactory
   */

  'svg-icon($path, $selectors)': (arg1, arg2, done) => {
    const nArg1 = { text: arg1.dartValue.text }
    const nArg2 = arg2.dartValue
    inliner([nArg1, nArg2]).then((res) => done(res))
  },
}
