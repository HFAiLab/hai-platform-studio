import { message } from 'ant-design-vue'

export function copyToClipboard(text: string): boolean {
  const input = document.createElement('textarea')
  input.value = text
  document.body.appendChild(input)
  input.select()
  const result = document.execCommand('copy')
  document.body.removeChild(input)
  return result
}

export function copyWithTip(text: string): void {
  const success = copyToClipboard(text)
  if (success) {
    message.success('成功拷贝内容到剪切板')
  } else {
    message.success('拷贝失败')
  }
}
