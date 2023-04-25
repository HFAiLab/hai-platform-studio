// HINT: 避免直接：import * as monaco from 'monaco-editor'，这样会造成多余引入非常多的文件
import 'monaco-editor/esm/vs/editor/browser/coreCommands.js'
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import Viewer from 'viewerjs'

export const LOG_COOL_MONACO_THEME = 'logcoremonacotheme'
export const LOG_COOL_MONACO_THEME_DARK = 'logcoremonacothemedark'

export const StartTrainingRegex =
  /(\[start training .*?\(([0-9]*)\).*?on.*? for .*?$|\[start service \[.*?\] of task \[.*?\] on .*? for .*?\]$)/

export const HFMediaImage = /\[HFAI_PRINT:IMAGE\]\s/
export const HFMediaImagePrefix = /^(.*)?\[HFAI_PRINT:IMAGE\]\s/
export const HFMediaTQDM = /\[HFAI_PRINT:TQDM\]/

export const MonacoLineHeight = 19
export const MAXMediaImageHeight = MonacoLineHeight * 20

export const MAXMediaImageWidth = 600

export const HFMediaImageSvgWidthHeight =
  /<svg[^>]*?width=['"]?([0-9.]*)[^>]*?height=['"]?([0-9.]*)/
export const HFMediaImageSvgHeightWidth =
  /<svg[^>]*?height=['"]?([0-9.]*)[^>]*?width=['"]?([0-9.]*)/

let monacoPrepared = false

export function monacoPrepare() {
  if (monacoPrepared) return

  monaco.languages.register({
    id: 'hflog',
  })
  monaco.languages.setMonarchTokensProvider('hflog', {
    tokenizer: {
      root: [
        /**
         * hint: 性能优化
         * 1. /i 和 .*? 这种匹配的方式会有比较大的性能消耗，并且不是线性的：
         * 2. 前向匹配比反向匹配性能差很多
         * 3. 非匹配的性能也不是很好
         * 实测发现 10KB 1.1s、15KB 2.4s、20KB 4.17s、50KB 25.91s
         * 因此我们在正则解析的过程中去掉这些内容
         *
         * 另外，Monaco 还有一个逻辑，单行超过 10000 个字符，超过的部分以 ... 代替
         */
        // hint: 这里的 /i 在 Monaco 的场景下实测不是特别管用，所以我们需要注意一下
        // 100 和 200 是我们的一个经验值，超过这个数字，高亮上面牺牲一些（一般 Error 都打印在比较前面，所以前面的少点）
        // 优化后 4MB 单行，解析时间在 1.5 秒
        [/[a-zA-Z_-]{0,100}[Ee][rR][Rr][Oo][Rr].{0,200}/, 'custom-error'],
        [/[a-zA-Z_-]{0,100}[Nn][Oo][Tt][Ii][Cc][Ee].{0,200}/, 'custom-notice'],
        [/[a-zA-Z_-]{0,100}[Ii][Nn][Ff][Oo].{0,200}/, 'custom-info'],
        [/[a-zA-Z_-]{0,100}[Ww][Aa][Rr][Nn].{0,200}/, 'custom-warn'],
        [/".{0,200}\.py"/, 'custom-info-low'],
        [StartTrainingRegex, 'custom-start'],
        [/\[SmartRestart\].*?$/, 'custom-smart-restart'],
        /* eslint-disable-next-line */
        [/(^|\[|\s)[0-9\.]+(\s|$|,|])/, 'custom-number'],
        /* eslint-disable-next-line */
        [/[0-9]{2}:[0-9]{2}:[0-9]{2}/, 'custom-date'],
        /* eslint-disable-next-line */
        [/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/, 'custom-date'],
        [/\[[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]*\]/, 'custom-date'],
      ],
    },
  })

  const commonDefineColors = [
    /**
     * hint: 这里不建议使用加粗了，在我们当前的实现下，需要多加载字体，并且有的时候加粗的效果也不那么直观，还可能造成字体宽度测量问题
     */
    { token: 'custom-number', foreground: '569cd6' },
    { token: 'custom-info', foreground: '33b833' },
    { token: 'custom-start', foreground: '00b0c1' },
    { token: 'custom-info-low', foreground: '009800' },
    { token: 'custom-error', foreground: 'ff0000' },
    { token: 'custom-warn', foreground: 'd9822b' },
    { token: 'custom-notice', foreground: 'FFA500' },
    { token: 'custom-date', foreground: '808080' },
    { token: 'custom-highlight', foreground: 'ffa500' },
    { token: 'custom-smart-restart', foreground: 'ff6f1b' },
  ]

  // Define a new theme that contains only rules that match this language
  monaco.editor.defineTheme(LOG_COOL_MONACO_THEME, {
    base: 'vs',
    inherit: true,
    rules: [...commonDefineColors],
    colors: {},
  })

  monaco.editor.defineTheme(LOG_COOL_MONACO_THEME_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [...commonDefineColors],
    colors: {},
  })

  monacoPrepared = true
}

export interface MediaContentWidgetProps {
  lineNumber: number // 在那一行开始
  lines: number // 占几行
  imageInfo: HFMediaImageInfo
}

export interface HFMediaImageInfo {
  content: string // base64
  width?: number
  height?: number
  image_width?: number
  image_height?: number
  type: string
  uuid: string
}

export const getImageSizeAndContent = (imageInfo: HFMediaImageInfo) => {
  let height = MAXMediaImageHeight
  let width: number | string = 'auto'
  let content: string

  if (imageInfo.type !== 'svg') {
    content = `data:img/${imageInfo.type};base64,${imageInfo.content}`

    let imageExpectHeight: number
    let imageExpectWidth: number

    if (imageInfo.height && imageInfo.width) {
      imageExpectHeight = imageInfo.height
      imageExpectWidth = imageInfo.width
    } else if (imageInfo.image_height && imageInfo.image_width) {
      imageExpectHeight = imageInfo.image_height
      imageExpectWidth = imageInfo.image_width
    } else {
      imageExpectHeight = MonacoLineHeight
      imageExpectWidth = MonacoLineHeight
    }

    height = Math.min(imageExpectHeight, MAXMediaImageHeight)
    width = (imageExpectWidth / imageExpectHeight) * height

    if (width > MAXMediaImageWidth) {
      width = MAXMediaImageWidth
      height = (imageExpectHeight / imageExpectWidth) * width
    }
  } else {
    // 尝试读取 svg 的宽高，这里没有用解析器，而是使用正则，会快一点
    const svgContent = window.atob(imageInfo.content)
    content = `data:image/${imageInfo.type}+xml;base64,${imageInfo.content}`

    const updateHeightWidth = (parseWidth: string, parseHeight: string) => {
      const parseWidthNum = parseFloat(parseWidth)
      const parseHeightNum = parseFloat(parseHeight)
      if (parseWidthNum && parseHeightNum) {
        height = Math.min(parseHeightNum, MAXMediaImageHeight)
        width = (parseWidthNum / parseHeightNum) * height

        if (width > MAXMediaImageWidth) {
          width = MAXMediaImageWidth
          height = (parseHeightNum / parseWidthNum) * width
        }
      }
    }

    if (imageInfo.width && imageInfo.height) {
      updateHeightWidth(`${imageInfo.width}`, `${imageInfo.height}`)
    } else if (HFMediaImageSvgWidthHeight.test(svgContent)) {
      const [, parseWidth, parseHeight] = HFMediaImageSvgWidthHeight.exec(
        svgContent,
      ) as unknown as [unknown, string, string]
      updateHeightWidth(parseWidth, parseHeight)
    } else if (HFMediaImageSvgHeightWidth.test(svgContent)) {
      const [, parseHeight, parseWidth] = HFMediaImageSvgHeightWidth.exec(
        svgContent,
      ) as unknown as [unknown, string, string]
      updateHeightWidth(parseWidth, parseHeight)
    } else {
      height = 100
    }
  }

  return {
    height,
    width,
    content,
  }
}

export const getMediaContentWidget = (mediaProps: MediaContentWidgetProps) => {
  const { width, height, content } = getImageSizeAndContent(mediaProps.imageInfo)
  const moveLines = Math.floor(mediaProps.lines / 2)
  const centerLineNumber = Math.floor(mediaProps.lineNumber + moveLines)

  return {
    domNode: null,
    getId: () => {
      return mediaProps.imageInfo.uuid
    },
    allowEditorOverflow: true,
    getDomNode: () => {
      const domNode = document.createElement('div')
      const imgNode = document.createElement('img')
      imgNode.src = content
      imgNode.style.width = `${width}px`
      imgNode.style.height = `${height}px`

      domNode.appendChild(imgNode)

      domNode.classList.add('monaco-log-image-container')
      domNode.style.transform = `translateY(-${moveLines * MonacoLineHeight}px)`

      domNode.addEventListener('click', () => {
        const image = document.createElement('img')
        image.src = content
        image.style.width = '400px'
        const viewer = new Viewer(image, {
          inline: false,
          navbar: false,
          className: 'w-image-viewer-root',
          toolbar: false,
          maxZoomRatio: 1.5,
          minZoomRatio: 0.2,
          title: () => '',
        })
        viewer.show()
      })

      return domNode
    },
    /**
     * 目前存在一个问题，当内容首行超过可见区域的时候会被隐藏，这个时候即使显示，top 偏移也是不对的。
     * 我们可以通过 translate 来让内容在可见区域不超过一半的时候，从而进行一定的体验优化。
     *
     * 相关代码：
     * 在 vscode 这个仓库的 vscode/src/vs/editor/browser/viewParts/contentWidgets/contentWidgets.ts
     * 计算包围区 top 的代码：
     *     const top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.scrollTop;
     *
     * 因为减去了 ctx.scrollTop，所以它的高度偏移是非预期的。
     * 这个代码所处的位置很深，而且没有可选参数供配置，直接改动的风险比较大，目前计划暂时先不调整了。
     * 后面如果大家相关的功能用的比较频繁，我们再考虑优化和修改这里
     */
    getPosition: () => {
      return {
        position: {
          lineNumber: centerLineNumber,
          column: 0,
        },
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
      }
    },
  }
}
