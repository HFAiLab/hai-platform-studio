import { toH } from 'hast-to-hyperscript'
import lang_bash from 'highlight.js/lib/languages/bash'
import lang_javascript from 'highlight.js/lib/languages/javascript'
import lang_json from 'highlight.js/lib/languages/json'
import lang_python from 'highlight.js/lib/languages/python'
import lang_shell from 'highlight.js/lib/languages/shell'
import lang_yaml from 'highlight.js/lib/languages/yaml'
import { lowlight } from 'lowlight/lib/core'
import React from 'react'

// 因为编译时默认引用会被 tree shaking，此处手动注册
lowlight.registerLanguage('bash', lang_bash)
lowlight.registerLanguage('javascript', lang_javascript)
lowlight.registerLanguage('json', lang_json)
lowlight.registerLanguage('python', lang_python)
lowlight.registerLanguage('shell', lang_shell)
lowlight.registerLanguage('bash', lang_bash)
lowlight.registerLanguage('yaml', lang_yaml)

export const Code2RC = (p: { code: string; lang: string; className?: string }) => {
  const { className, code, lang, ...props } = p
  try {
    const tree = lowlight.highlight(lang, code)
    const reactNode = toH(React.createElement, tree)
    return reactNode
  } catch (e) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <code className={className} {...props}>
        {code}
      </code>
    )
  }
}
