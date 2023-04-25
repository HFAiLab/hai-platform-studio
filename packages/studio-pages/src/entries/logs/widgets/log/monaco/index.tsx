/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-underscore-dangle */
import type { TaskLogRestartLogMap } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import React, { useContext, useEffect, useRef } from 'react'
import { useUpdateEffect } from 'react-use/esm'
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from '../../..'
import { useRefState } from '../../../../../hooks/useRefState'
import { HFLoading } from '../../../../../ui-components/HFLoading'
import { isDarkTheme } from '../../../../../utils'
import type { SplitLineJumpOptions } from '../../../schema/event'
import { EventsKeys } from '../../../schema/event'
import { logDateReg } from './language'
import type { HFMediaImageInfo } from './prepare'
import {
  HFMediaImage,
  HFMediaImagePrefix,
  HFMediaTQDM,
  LOG_COOL_MONACO_THEME,
  LOG_COOL_MONACO_THEME_DARK,
  MonacoLineHeight,
  StartTrainingRegex,
  getImageSizeAndContent,
  getMediaContentWidget,
  monacoPrepare,
} from './prepare'

enum WordWrapEnums {
  on = 'on',
  off = 'off',
}

// eslint-disable-next-line no-restricted-globals
if (!window.MonacoEnvironment) {
  // eslint-disable-next-line no-restricted-globals
  window.MonacoEnvironment = {
    getWorkerUrl() {
      return './editor.worker.bundle.js'
    },
  }
}

declare global {
  interface Window {
    hf_monaco_instances_ref: WeakMap<monaco.editor.IStandaloneCodeEditor, number>
    if_monaco_remeasure_font: boolean | undefined
    // MonacoEnvironment: monaco.Environment | undefined // 这里声明后会和 node_modules 中的有所冲突
  }
}

export interface IncrementalLog {
  updateTime: number
  content: string
  frontierId: number | null
}

interface MonacoScrollContent {
  currentScrollTop: number
  currentScrollHeight: number
  currentContainerHeight: number
  scrollDX: number
}

export const MonacoViewer: React.FC<{
  showLineTime: boolean
  showSystemLog: boolean
  rawLog: string | undefined
  containerTheme: string
  handleCR: boolean
  isFetching: boolean
  miniMapEnabled: boolean
  wordWrap: WordWrapEnums
  invokeFind: number
  restartLog?: TaskLogRestartLogMap
  incrementalLog?: IncrementalLog
  IORawLogReInit?: number
  id_list: number[]
}> = (props) => {
  // 自定义语言和高亮支持
  monacoPrepare()

  const editorRef = useRef<HTMLDivElement>(null)
  const [currentEditorInstance, currentEditorInstanceRef, updateCurrentEditorInstance] =
    useRefState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const srvc = useContext(ServiceContext)
  const splitLines = useRef<number[]>([])

  const imageWidgets = useRef<Map<string, monaco.editor.IContentWidget>>(new Map())
  const lastRawLogRef = useRef<string | undefined>()
  const restartLogParsedMap = useRef<Map<string, boolean>>(new Map()) // key: id:rule
  const latestTaskIDStrRef = useRef<string>('')

  function preProcessLogsV2(options: {
    lastRawLog: string | undefined
    rawLog: string | undefined
    ifAppend: boolean
  }) {
    const rawLogStr = options.rawLog || ''
    const lastRawLogStr = options.lastRawLog || ''
    // rawLogLists 初次处理了 \r 的原始日志行
    let rawLogLists: string[] = []
    // 依次经过多次处理，返回的部分
    let logListWithMediaStrip: string[] = []

    // 返回的内容
    const widgets: any[] = []
    const imageMediaRanges: monaco.Range[] = []
    let deleteLastLine = false

    if (props.handleCR) {
      rawLogLists = rawLogStr.split(/\n/g).map((text) => {
        const idx = text.lastIndexOf('\r')
        return idx === -1 ? text : text.slice(idx + 1)
      })
    } else {
      rawLogLists = rawLogStr.split(/[\n\r]/g)
    }

    for (let index = 0; index < rawLogLists.length; index += 1) {
      let logLine = rawLogLists[index]!

      const logStartIdStr = StartTrainingRegex.exec(logLine)?.[2]

      /**
       * hint: restart_log 需要由前端加入，这个处理逻辑为
       * 当处理到一个 chain_id 的时候：
       *     当前是否有没有处理的 restart_log：
       *         无：啥也不做
       *         有：遍历未处理的 restart_log
       *            task_id 是当前 id：跳过
       *            task_id 是上一个 id：加到上面
       *            task_id 是上两个 id 以上：这个情况对于全量和增量都不太可能，肯定前面被处理过了
       * 在本次 process 结束的时候：遍历 restart_log
       *        这时候只可能是上面跳过的当前 id 的 restart_log，加到下面
       *
       * 概要解读：
       * restart_log 的 key 是该行 id, 跳过, restart_log 的 key 是该行 id 的上一个任务 id, 在该行之前塞入 restart 日志
       *    不考虑 key 是上上个 id 的情况，该情况应该在前面的行被处理过
       */
      if (logStartIdStr) {
        latestTaskIDStrRef.current = logStartIdStr

        if (props.restartLog) {
          const currentLineIdIndex = props.id_list.findIndex((id) => id === Number(logStartIdStr))
          const prevId = currentLineIdIndex > 0 ? props.id_list[currentLineIdIndex - 1] : undefined

          for (const [idStr, restartLists] of Object.entries(props.restartLog)) {
            if (idStr === logStartIdStr) continue

            for (const restartInfo of restartLists) {
              const cacheKey = `${idStr}:${restartInfo.rule}`
              if (restartLogParsedMap.current.has(cacheKey)) continue
              if (idStr !== `${prevId}`) continue

              restartLogParsedMap.current.set(cacheKey, true)
              const restartLog = `[SmartRestart]${restartInfo.result} rule: ${
                restartInfo.rule
              }, reason: ${(restartInfo.reason || '').trim()}`
              logListWithMediaStrip.push(restartLog)
            }
          }
        }
      }

      if (HFMediaImage.test(logLine)) {
        // 图片日志：
        try {
          const source = logLine.replace(HFMediaImagePrefix, '')
          const imageInfo = JSON.parse(window.atob(source)) as HFMediaImageInfo
          const { height } = getImageSizeAndContent(imageInfo)
          const lines = Math.ceil(height / MonacoLineHeight)

          // 如果要展示时间，就多一行只展示个时间
          if (props.showLineTime) {
            const lineDateStr = logDateReg.exec(logLine)?.[1]
            if (lineDateStr) {
              logListWithMediaStrip.push(lineDateStr)
            }
          }

          let beginLineNumber = logListWithMediaStrip.length + 1
          if (options.ifAppend && currentEditorInstanceRef.current) {
            const lineCount = currentEditorInstanceRef.current.getModel()!.getLineCount() - 1 // 最后一行是个回车，这里减一
            beginLineNumber += lineCount
          }

          widgets.push(
            getMediaContentWidget({
              lineNumber: beginLineNumber,
              lines,
              imageInfo,
            }),
          )

          imageMediaRanges.push(new monaco.Range(beginLineNumber, 0, beginLineNumber + lines, 1))
          // 留 n 个空行，用以展示图片
          for (let i = 0; i < lines; i += 1) {
            logListWithMediaStrip.push('\t')
          }
        } catch (e) {
          console.error('Parse Image Error', e)
          // 解析出错，当做普通的
          logListWithMediaStrip.push(logLine)
        }
      } else if (HFMediaTQDM.test(logLine)) {
        // TQDM:
        try {
          if (index === 0) {
            const lastRawLogs = lastRawLogStr.trim().split(/\n/g)
            if (lastRawLogs.length && HFMediaTQDM.test(lastRawLogs[lastRawLogs.length - 1]!)) {
              // 如果当前是首行，判断是否删除上次的上一行
              deleteLastLine = true
            }
          }
          while (rawLogLists[index + 1] && HFMediaTQDM.test(rawLogLists[index + 1]!)) {
            index += 1
          }
          logLine = rawLogLists[index]!
          logListWithMediaStrip.push(logLine.replace(HFMediaTQDM, ''))
        } catch (e) {
          // 解析出错，当做普通的
          logListWithMediaStrip.push(logLine)
        }
      } else {
        // 普通日志：
        logListWithMediaStrip.push(logLine)
      }
    }

    // 当前的日志都处理完了，再过滤一遍 restartLog
    if (props.restartLog) {
      for (const [idStr, restartLists] of Object.entries(props.restartLog)) {
        // hint: 这个判断是不能省略的，如果省略了，那么可能超过 4MB 被滚没了的日志，就会全都输出在这里
        if (idStr !== latestTaskIDStrRef.current) continue
        for (const restartInfo of restartLists) {
          const cacheKey = `${idStr}:${restartInfo.rule}`
          if (restartLogParsedMap.current.has(cacheKey)) continue
          restartLogParsedMap.current.set(cacheKey, true)
          const restartLog = `[SmartRestart]${restartInfo.result} rule: ${
            restartInfo.rule
          }, reason: ${(restartInfo.reason || '').trim()}`
          logListWithMediaStrip.push(restartLog)
        }
      }
    }

    if (!props.showLineTime) {
      logListWithMediaStrip = logListWithMediaStrip.map((line) => {
        return line.replace(logDateReg, '')
      })
    }

    if (logListWithMediaStrip.length) {
      return {
        logs: logListWithMediaStrip,
        widgets,
        deleteLastLine,
        imageMediaRanges,
      }
    }

    // logListWithMediaStrip 为空
    if (!props.isFetching) {
      return {
        logs: ['No log for current experiment.'],
        widgets,
        deleteLastLine,
        imageMediaRanges,
      }
    }

    return {
      logs: [''],
      widgets,
      deleteLastLine,
      imageMediaRanges,
    }
  }

  function getScrollContent(monacoInstance?: monaco.editor.IStandaloneCodeEditor | null) {
    if (!editorRef.current) return null
    if (!monacoInstance) return null
    const currentScrollTop = monacoInstance.getScrollTop()
    const currentScrollHeight = monacoInstance.getScrollHeight()
    const currentContainerHeight = editorRef.current.offsetHeight
    const scrollDX = 10

    return {
      currentScrollTop,
      currentScrollHeight,
      currentContainerHeight,
      scrollDX,
    }
  }

  function autoScroll(
    monacoInstance?: monaco.editor.IStandaloneCodeEditor | null,
    scrollInfo?: MonacoScrollContent | null,
  ) {
    if (!monacoInstance) return

    // 自动跳转到最后一行或者上一次的位置
    if (!scrollInfo || scrollInfo.currentScrollTop === null) {
      monacoInstance.revealLine(monacoInstance!.getModel()!.getLineCount())
    } else if (
      scrollInfo.currentScrollTop + scrollInfo.currentContainerHeight + scrollInfo.scrollDX >
      scrollInfo.currentScrollHeight!
    ) {
      monacoInstance.revealLine(monacoInstance!.getModel()!.getLineCount())
    } else {
      monacoInstance.setScrollTop(scrollInfo.currentScrollTop)
    }
  }

  const jumpToSplitLine = (options: SplitLineJumpOptions) => {
    if (!currentEditorInstance) return

    const startVisibleLine = currentEditorInstance.getVisibleRanges()[0]?.startLineNumber
    const endVisibleLine = currentEditorInstance.getVisibleRanges()[0]?.endLineNumber

    if (startVisibleLine === undefined || endVisibleLine === undefined) return
    if (!splitLines.current.length) return

    const toaster = srvc.app.api().getHFUIToaster()

    if (options.direction === 'up') {
      if (startVisibleLine - 1 <= splitLines.current[0]!) {
        toaster.show({
          message: i18n.t(i18nKeys.biz_logViewer_split_line_jump_top_already_visible),
        })
        return
      }
      const getPreSplitLineFromCurrent = () => {
        const preLines = splitLines.current.filter((line) => line <= startVisibleLine - 2)
        return preLines[preLines.length - 1]
      }
      const preLine = getPreSplitLineFromCurrent()
      if (preLine !== undefined) {
        // hint: 这里使用了 magic number，避免引入更多的 enum 增大打包体积
        currentEditorInstance.revealLineInCenter(preLine, 0)
      }
    } else if (options.direction === 'down') {
      if (
        endVisibleLine >= splitLines.current[splitLines.current.length - 1]! &&
        startVisibleLine <= splitLines.current[splitLines.current.length - 1]!
      ) {
        toaster.show({
          message: i18n.t(i18nKeys.biz_logViewer_split_line_jump_bottom_already_visible),
        })
        return
      }
      const getNextSplitLineFromCurrent = () => {
        const nextLines = [...splitLines.current].filter((line) => line > endVisibleLine)
        return nextLines.length ? nextLines[0] : splitLines.current[splitLines.current.length - 1]
      }
      const nextLine = getNextSplitLineFromCurrent()
      if (nextLine !== undefined) currentEditorInstance.revealLineInCenter(nextLine, 0)
    } else if (options.direction === 'bottom') {
      if (
        endVisibleLine >= splitLines.current[splitLines.current.length - 1]! &&
        startVisibleLine <= splitLines.current[splitLines.current.length - 1]!
      ) {
        toaster.show({
          message: i18n.t(i18nKeys.biz_logViewer_split_line_jump_bottom_already_visible),
        })
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      currentEditorInstance.revealLineInCenter(
        splitLines.current[splitLines.current.length - 1]!,
        0,
      )
    }
  }

  useEffect(() => {
    srvc.app.on(EventsKeys.SplitLineJump, jumpToSplitLine)
    return () => {
      srvc.app.off(EventsKeys.SplitLineJump, jumpToSplitLine)
    }
  })

  const setValueAndDecorations = (
    monacoEditorInstance: monaco.editor.IStandaloneCodeEditor,
    values: string[],
    options?: {
      range?: monaco.IRange // 有 range 说明是增量了
      imageMediaRanges: monaco.IRange[]
    },
  ) => {
    // hint: 针对动态 append 的日志，-2 是因为 -1 到最后一行的索引，然后再减去 1 行因为最后一行只有换行
    // 另外，意外情况下少一行会比多一行更安全，如果当前不存在更多的一行，会导致样式错乱
    const indexOffset = options?.range?.endLineNumber ? options.range.endLineNumber - 2 : 0

    const beginSplitLines = []
    for (const [index, line] of values.entries()) {
      // if (/^分段实验开始/.test(line)) { // 测试可以用这个
      if (StartTrainingRegex.test(line)) {
        beginSplitLines.push(index + 1 + indexOffset)
      }
    }

    if (options?.range) {
      splitLines.current = [...splitLines.current, ...beginSplitLines]
    } else {
      splitLines.current = beginSplitLines
    }

    if (options?.range) {
      monacoEditorInstance.executeEdits('', [{ range: options.range, text: values.join('\n') }])
    } else {
      monacoEditorInstance.setValue(values.join('\n'))
    }

    monacoEditorInstance.deltaDecorations(
      [],
      [
        ...beginSplitLines.map((line) => {
          return {
            range: new monaco.Range(line, 0, line, 0),
            options: {
              isWholeLine: true,
              className: 'split-line-decoration',
              marginClassName: 'split-line-decoration',
              overviewRuler: {
                color: '#00b0c1',
                darkColor: '#00b0c1',
                position: 7,
              },
              minimap: {
                color: '#00b0c1',
                darkColor: '#00b0c1',
                position: 1,
              },
            },
          }
        }),
        ...options!.imageMediaRanges.map((range) => {
          return {
            range,
            options: {
              minimap: {
                color: '#9acd32',
                position: 2,
              },
            },
          }
        }),
      ],
    )
  }

  const addContentWidgets = (
    monacoEditorInstance: monaco.editor.IStandaloneCodeEditor,
    widgets: monaco.editor.IContentWidget[],
  ) => {
    for (const widget of widgets) {
      const id = widget.getId() as string
      if (imageWidgets.current.has(id)) {
        const lastWidget = imageWidgets.current.get(id)
        if (lastWidget) {
          monacoEditorInstance.removeContentWidget(widget)
        }
      }
      monacoEditorInstance.addContentWidget(widget)
      imageWidgets.current.set(id, widget)
    }
  }

  useEffect(() => {
    if (editorRef.current) {
      const scrollContent = getScrollContent(currentEditorInstanceRef.current)
      // const { logs: logLists, widgets } = preProcessLogs(logDemo)
      restartLogParsedMap.current = new Map()
      latestTaskIDStrRef.current = ''

      const {
        logs: logLists,
        widgets,
        imageMediaRanges,
      } = preProcessLogsV2({
        rawLog: props.rawLog,
        lastRawLog: undefined,
        ifAppend: false,
      })
      lastRawLogRef.current = props.rawLog
      let nextEditorInstance: monaco.editor.IStandaloneCodeEditor

      if (!currentEditorInstanceRef.current) {
        /**
         * 这里有一个更新：value 我们先设置为空，之后通过 setValue 设置进去，这样做得原因是：
         *
         * 实际上 logContent 大多数时候都是空的，都依赖后面返回。
         * 但如果日志返回的太快（这里的太快通常指的是几十毫秒以内），甚至志返回的比动态加载的模块还要快，这个时候是有值的。
         * 此时换行（wordWrap: off）是不生效的。
         *
         * 这个的深入原因尚且不知，不过目前发现，通过顺延 setValue 操作到后面可以解决这个问题。
         */
        nextEditorInstance = monaco.editor.create(editorRef.current, {
          value: '',
          language: 'hflog',
          fontLigatures: false,
          // 为了能够展示一些绘图的逻辑，需要指定一个特殊的字体，需要宿主环境有提供这个字体，默认的字体是 'Consolas, "Courier New", monospace',
          fontFamily: 'patch-source-code-pro',
          folding: true,
          theme: isDarkTheme(props.containerTheme)
            ? LOG_COOL_MONACO_THEME_DARK
            : LOG_COOL_MONACO_THEME,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          minimap: {
            enabled: props.miniMapEnabled,
          },
          smoothScrolling: true,
          formatOnPaste: true,
          renderValidationDecorations: 'on',
          readOnly: true,
          // HINT: 最后一行日志之后，是否允许继续滚动，默认是允许的，对查看日志不是特别的友好
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: props.wordWrap,
        })
        // 一般耗时大约几毫秒
        document.fonts.ready.then(() => {
          if (window.if_monaco_remeasure_font) return
          monaco.editor.remeasureFonts()
          window.if_monaco_remeasure_font = true
        })
        setValueAndDecorations(nextEditorInstance, logLists, {
          imageMediaRanges,
        })
        addContentWidgets(nextEditorInstance, widgets)
      } else {
        nextEditorInstance = currentEditorInstanceRef.current
        if (nextEditorInstance.getValue() !== logLists.join('\n'))
          setValueAndDecorations(nextEditorInstance, logLists, {
            imageMediaRanges,
          })

        addContentWidgets(nextEditorInstance, widgets)
      }

      if (!window.hf_monaco_instances_ref) window.hf_monaco_instances_ref = new WeakMap()
      window.hf_monaco_instances_ref.set(nextEditorInstance, 1)

      // 自动跳转到最后一行或者上一次的位置
      autoScroll(nextEditorInstance, scrollContent)
      updateCurrentEditorInstance(nextEditorInstance)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef, props.showLineTime, props.IORawLogReInit])

  useEffect(() => {
    if (!props.incrementalLog) {
      srvc.app.api().getLogger().error('[inc] incrementalLog error')
      return
    }

    if (!currentEditorInstanceRef.current) {
      srvc.app
        .api()
        .getLogger()
        .error(
          `currentEditorInstanceRef.current is null for id: ${props.incrementalLog.frontierId}`,
        )
      // props.incrementalLog.frontierId && IOFrontier.getInstance().unsub(props.incrementalLog.frontierId);
      return
    }

    const scrollContent = getScrollContent(currentEditorInstanceRef.current)

    try {
      currentEditorInstanceRef.current.updateOptions({ readOnly: false })
      const { logs, widgets, deleteLastLine, imageMediaRanges } = preProcessLogsV2({
        rawLog: props.incrementalLog.content,
        lastRawLog: lastRawLogRef.current,
        ifAppend: true,
      })
      lastRawLogRef.current = props.incrementalLog.content

      const lineCount = currentEditorInstanceRef.current.getModel()!.getLineCount()
      const lastLineLength = currentEditorInstanceRef.current
        .getModel()!
        .getLineMaxColumn(lineCount)

      const range = deleteLastLine
        ? new monaco.Range(lineCount - 1, 0, lineCount, lastLineLength)
        : new monaco.Range(lineCount + 1, 0, lineCount + 1, 0)

      setValueAndDecorations(currentEditorInstanceRef.current, logs, {
        range,
        imageMediaRanges,
      })
      addContentWidgets(currentEditorInstanceRef.current, widgets)
      currentEditorInstanceRef.current.updateOptions({ readOnly: true })
    } catch (e) {
      console.error('currentEditorInstanceRef.current error:', e)
    }

    // 自动跳转到最后一行或者上一次的位置
    autoScroll(currentEditorInstanceRef.current, scrollContent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.incrementalLog])

  useUpdateEffect(() => {
    currentEditorInstanceRef.current?.updateOptions({
      minimap: {
        enabled: props.miniMapEnabled,
        showSlider: 'always',
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.miniMapEnabled])

  useUpdateEffect(() => {
    currentEditorInstanceRef.current?.updateOptions({
      wordWrap: props.wordWrap,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.wordWrap])

  useUpdateEffect(() => {
    currentEditorInstanceRef.current?.updateOptions({
      theme: isDarkTheme(props.containerTheme) ? LOG_COOL_MONACO_THEME_DARK : LOG_COOL_MONACO_THEME,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.containerTheme])

  useUpdateEffect(() => {
    if (currentEditorInstanceRef.current) {
      currentEditorInstanceRef.current.getAction('actions.find')?.run()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.invokeFind])

  useEffect(() => {
    return () => {
      if (currentEditorInstanceRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        currentEditorInstanceRef.current.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div
        className={`${'hf-mona-editor-container'} ${props.showSystemLog ? 'syslog' : ''}`}
        ref={editorRef}
      />
      {props.isFetching && (
        <div className="hflog-loading-container">
          <HFLoading />
        </div>
      )}
    </>
  )
}

export default MonacoViewer
