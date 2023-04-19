import { useEffect } from 'react'

// 页面展示的时候调用
export const usePageFocus = (callback: () => any) => {
  useEffect(() => {
    function pageFocusCallback() {
      callback()
    }
    window.addEventListener('focus', pageFocusCallback)
    return () => {
      window.removeEventListener('focus', pageFocusCallback)
    }
  })
}
