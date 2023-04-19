import Vditor from '@hai-platform/vditor'

export interface XEditorOptions {
  containerDom: HTMLElement
  theme: 'dark' | 'classic'
  token: string
  // 缓存草稿的 key
  cacheKey?: string
  // bff 路径，用于文件上传
  bffURL: string
  // 静态资源的 CDN 路径
  staticURL?: string
  // 提示的逻辑
  hint?: IHint
  // 最大字数
  counterMax?: number
  // 最小高度
  minHeight?: number
  // 指定高度
  height?: number
  // 指定宽度
  width?: number
  // 初始化完成的回调
  after?(): void
  // 输入回调
  input?(value: string): void
  // 聚焦回调
  focus?(value: string): void
  // 失焦回调
  blur?(value: string): void
}

export interface StaticRenderOptions {
  staticURL?: string
  after?(): void
}

const EmojiMap = {
  'praise': 'vditor@3.8.17/dist/images/emoji/extend/praise.png',
  'celebrate': 'vditor@3.8.17/dist/images/emoji/extend/celebrate.png',
  'ok': 'vditor@3.8.17/dist/images/emoji/extend/ok.png',
  'heart': 'vditor@3.8.17/dist/images/emoji/extend/heart.png',
  'salute': 'vditor@3.8.17/dist/images/emoji/extend/salute.png',
  'sad': 'vditor@3.8.17/dist/images/emoji/extend/sad.png',
  'newbee': 'vditor@3.8.17/dist/images/emoji/extend/newbee.png',
  'doubt': 'vditor@3.8.17/dist/images/emoji/extend/doubt.png',
  'angry': 'vditor@3.8.17/dist/images/emoji/extend/angry.png',
  'strabismus': 'vditor@3.8.17/dist/images/emoji/extend/strabismus.png',
  'love': 'vditor@3.8.17/dist/images/emoji/extend/love.png',
  '666': 'vditor@3.8.17/dist/images/emoji/extend/666.png',
  'xx': 'vditor@3.8.17/dist/images/emoji/extend/xx.png',
  'depressed': 'vditor@3.8.17/dist/images/emoji/extend/depressed.png',
  'emm': 'vditor@3.8.17/dist/images/emoji/extend/emm.png',
  'stare': 'vditor@3.8.17/dist/images/emoji/extend/stare.png',
  'sweat': 'vditor@3.8.17/dist/images/emoji/extend/sweat.png',
  '404': 'vditor@3.8.17/dist/images/emoji/extend/404.png',
  'cool': 'vditor@3.8.17/dist/images/emoji/extend/cool.png',
  'smile': 'vditor@3.8.17/dist/images/emoji/extend/smile.png',
  'bared-teeth': 'vditor@3.8.17/dist/images/emoji/extend/bared-teeth.png',
  'laugh-and-cry': 'vditor@3.8.17/dist/images/emoji/extend/laugh-and-cry.png',
  'please': 'vditor@3.8.17/dist/images/emoji/extend/please.png',
  'sos': 'vditor@3.8.17/dist/images/emoji/extend/sos.png',
  'daze': 'vditor@3.8.17/dist/images/emoji/extend/daze.png',
  'bad-laugh': 'vditor@3.8.17/dist/images/emoji/extend/bad-laugh.png',
  'stuck': 'vditor@3.8.17/dist/images/emoji/extend/stuck.png',
  'insidious': 'vditor@3.8.17/dist/images/emoji/extend/insidious.png',
  'tsundere': 'vditor@3.8.17/dist/images/emoji/extend/tsundere.png',
  'flower': 'vditor@3.8.17/dist/images/emoji/extend/flower.png',
}

const DEFAULT_STATIC_URL = ''

const DEFAULT_MAX_COUNTER = 9999

export class XEditor {
  vditor: Vditor

  options: XEditorOptions

  private static getLuteRenderers(): ILuteRender {
    return {
      renderLinkText: (node, entering) => {
        if (entering) {
          // @ts-expect-error ignore cacheNodeText
          this.cacheNodeText = node.TokensStr()

          return ['', Lute.WalkContinue]
        }
        return ['', Lute.WalkContinue]
      },
      renderLinkDest: (node, entering) => {
        if (entering) {
          // @ts-expect-error ignore cacheLink
          this.cacheLink = node.TokensStr()
          return [``, Lute.WalkContinue]
        }
        return [``, Lute.WalkContinue]
      },
      renderLink: (node, entering) => {
        if (entering) {
          return [``, Lute.WalkContinue]
        }
        // @ts-expect-error ignore cacheNodeText
        let nodeText = this.cacheNodeText
        const highlight = /^#[0-9]*\|/g.test(nodeText)

        if (/^#[0-9]*\|/g.test(nodeText)) {
          if (entering) return ['', Lute.WalkContinue]
          const splitIndex = nodeText.indexOf('|')
          nodeText = `<i>${nodeText.slice(0, splitIndex)}&nbsp;</i>${nodeText.slice(
            splitIndex + 1,
          )}`
        }

        return [
          `<a href='${
            // @ts-expect-error ignore cacheLink
            this.cacheLink
          }' class=${highlight ? 'x-editor-highlight-a' : ''} target="_blank">${nodeText}</a>`,
          Lute.WalkContinue,
        ]
      },
      renderText(node: ILuteNode, entering) {
        const tokenStr = node.TokensStr()
        // const linkMatches = /#([0-9]+)/.exec(tokenStr)
        if (!entering) {
          // hint: 这里给出另外一种比较方便的自定义实现，可以自定义一些特殊的样式出来
          // if (linkMatches) {
          //   const linkNumberStr = linkMatches[1]!
          //   const { index } = linkMatches
          //   const len = linkNumberStr.length
          //   return [
          //     `${tokenStr.slice(
          //       0,
          //       index,
          //     )}<span className="linkSpan">linkspan:${linkNumberStr}</span>${tokenStr.slice(
          //       index + len + 1,
          //     )}`,
          //     Lute.WalkContinue,
          //   ]
          // }
          return [tokenStr, Lute.WalkContinue]
        }

        return ['', Lute.WalkContinue]
      },
    }
  }

  constructor(options: XEditorOptions) {
    this.options = options

    this.vditor = new Vditor(options.containerDom, {
      preview: {
        delay: 300,
        actions: [],
        // hint: 这里的 theme 如果不写，就会走默认的 theme，动态加载一个默认的 theme 会对我们的样式有所干扰
        theme: {
          current: 'hf-basic',
          path: `${options.staticURL || DEFAULT_STATIC_URL}/vditor@3.8.17/dist/css/content-theme`,
        },
      },
      upload: {
        url: `${options.bffURL}/xtopic/resource/upload`,
        headers: {
          token: options.token,
        },
      },
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        {
          name: '引用话题',
          tipPosition: 'n',
          tip: '手动输入 # 号快速查找和引用一个问题',
          className: 'right',
          icon: '<svg t="1665709672173" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4386" width="200" height="200"><path d="M128 341.333333m42.666667 0l682.666666 0q42.666667 0 42.666667 42.666667l0 0q0 42.666667-42.666667 42.666667l-682.666666 0q-42.666667 0-42.666667-42.666667l0 0q0-42.666667 42.666667-42.666667Z" fill="#666666" p-id="4387"></path><path d="M422.613333 85.333333H426.666667a38.613333 38.613333 0 0 1 38.4 42.453334L387.84 900.266667a42.666667 42.666667 0 0 1-42.453333 38.4H341.333333a38.613333 38.613333 0 0 1-38.4-42.453334L380.16 123.733333a42.666667 42.666667 0 0 1 42.453333-38.4zM678.613333 85.333333H682.666667a38.613333 38.613333 0 0 1 38.4 42.453334L643.84 900.266667a42.666667 42.666667 0 0 1-42.453333 38.4H597.333333a38.613333 38.613333 0 0 1-38.4-42.453334L636.16 123.733333a42.666667 42.666667 0 0 1 42.453333-38.4z" fill="#666666" p-id="4388"></path><path d="M128 597.333333m42.666667 0l682.666666 0q42.666667 0 42.666667 42.666667l0 0q0 42.666667-42.666667 42.666667l-682.666666 0q-42.666667 0-42.666667-42.666667l0 0q0-42.666667 42.666667-42.666667Z" fill="#666666" p-id="4389"></path></svg>',
        },
        '|',
        {
          name: '图片',
          tipPosition: 'n',
          tip: '拖拽上传图片',
          className: 'right',
          icon: '<svg t="1665561557929" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3790" width="200" height="200"><path d="M414.016 705.984c-47.552 0-121.984-188.032-158.016-112-14.976 31.616-39.936 99.008-64 152.96V768a64 64 0 0 0 64 64h512c35.392 0 64-28.608 64-64v-29.824c-36.16-81.408-83.008-216.32-128-268.16-92.032-105.984-201.984 235.968-289.984 235.968zM832 0H192a192 192 0 0 0-192 192v640c0 105.984 85.952 192 192 192h640c105.984 0 192-86.016 192-192V192c0-106.048-86.016-192-192-192z m64 832c0 35.392-28.608 64-64 64H192a64 64 0 0 1-64-64V192c0-35.328 28.672-64 64-64h640a64 64 0 0 1 64 64v640zM288 384c53.056 0 96-42.944 96-96S341.056 192 288 192 192 234.944 192 288s42.944 96 96 96z" fill="" p-id="3791"></path></svg>',
        },
        'line',
        'quote',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        'code',
        'inline-code',
        'insert-after',
        'insert-before',
        'undo',
        'redo',
        'link',
        'table',
        'fullscreen',
        'outline',
        'br',
        // 'edit-mode',
      ],
      minHeight: options.minHeight || 200,
      mode: 'sv',
      value: '',
      cdn: `${options.staticURL || DEFAULT_STATIC_URL}/vditor@3.8.17`,
      after: () => {
        if (this.options.after) {
          this.options.after()
        }
        this.vditor.vditor.lute.SetJSRenderers({
          renderers: {
            // hint: 预览的时候走的是这里
            // vditor 本身会有对 renderLinkDest 的覆盖，这里只要是名字不一样，就不会覆盖
            // 具体可以参考 lute 项目的 lute.go
            Md2VditorSVDOM: XEditor.getLuteRenderers(),
            Md2HTML: XEditor.getLuteRenderers(),
          },
        })
      },
      input: options.input,
      focus: options.focus,
      blur: options.blur,
      hint: {
        emoji: EmojiMap,
        ...options.hint,
      },
      height: options.height,
      width: options.width,
      counter: {
        enable: true,
        // 最大允许输入 9999 字符
        max: this.getCounterMax(),
      },
      cache: {
        enable: !!options.cacheKey,
        id: options.cacheKey,
      },
      theme: options.theme,
    })

    // @ts-expect-error because for debug
    window.last_vditor = this.vditor
  }

  getCounterMax() {
    return this.options.counterMax || DEFAULT_MAX_COUNTER
  }

  setTheme(theme: 'dark' | 'classic') {
    this.vditor.setTheme(theme)
  }

  static render(containerDom: HTMLDivElement, markdown: string, options?: StaticRenderOptions) {
    Vditor.preview(containerDom, markdown, {
      mode: 'dark',
      customEmoji: EmojiMap,
      theme: {
        current: 'hf-basic',
        path: `${options?.staticURL || DEFAULT_STATIC_URL}/vditor@3.8.17/dist/css/content-theme`,
      },
      emojiPath: `${options?.staticURL || DEFAULT_STATIC_URL}/vditor@3.8.17`,
      transform(html) {
        return html
      },
      after: () => {
        if (options?.after) options.after()
      },
      cdn: `${options?.staticURL || DEFAULT_STATIC_URL}/vditor@3.8.17`,
      renderers: XEditor.getLuteRenderers(),
    })
  }
}
