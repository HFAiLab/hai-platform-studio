import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import React, { useRef } from 'react'

/**
 * hint: 如果只引入 api，后果就是东西太少了，getWorker 不会被调用，应该是自己少引入了 link 等一些东西
 *       这样会导致没有高亮
 * 但是目前确实有可能是太大了
 */
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import useEffectOnce from 'react-use/esm/useEffectOnce'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { isDarkTheme } from '../../../utils/theme'
import type { JSONEditorProps } from './schema'

export const MONACO_THEME_LIGHT = 'vs'
export const MONACO_THEME_DARK = 'vs-dark'

// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      /* eslint-disable new-cap */
      return new jsonWorker()
    }
    /* eslint-disable new-cap */
    return new editorWorker()
  },
}

export const JSONEditor = (props: JSONEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  useEffectOnce(() => {
    let editor: monaco.editor.IStandaloneCodeEditor

    if (editorRef.current) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
        schemaValidation: 'error',
      })

      editor = monaco.editor.create(editorRef.current, {
        value: props.defaultValue,
        language: 'json',
        minimap: {
          enabled: false,
        },
        theme: isDarkTheme() ? MONACO_THEME_DARK : MONACO_THEME_LIGHT,
        scrollBeyondLastLine: false,
        renderValidationDecorations: 'on',
        fontSize: 13,
        wordWrap: 'on',
        lineNumbersMinChars: 3,
        readOnly: props.readonly,
      })
      editor.getModel()?.onDidChangeContent(() => {
        if (props.onChange) props.onChange(editor.getValue())
      })
    }

    const onThemeChange = () => {
      editor?.updateOptions({
        theme: isDarkTheme() ? MONACO_THEME_DARK : MONACO_THEME_LIGHT,
      })
    }
    hfEventEmitter.on(WebEventsKeys.themeChange, onThemeChange)

    return () => {
      editor.dispose()
      hfEventEmitter.off(WebEventsKeys.themeChange, onThemeChange)
    }
  })

  return <div className="json-editor-container" ref={editorRef} />
}

export default JSONEditor
