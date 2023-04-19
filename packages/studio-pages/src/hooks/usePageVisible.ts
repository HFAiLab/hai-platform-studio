import useEffectOnce from 'react-use/esm/useEffectOnce'

// 页面隐藏的时候调用
export const usePageVisible = (callback: () => any) => {
  useEffectOnce(() => {
    function docVisibilityChangeCallback() {
      if (document.visibilityState !== 'visible') return
      callback()
    }
    document.addEventListener('visibilitychange', docVisibilityChangeCallback)
    return () => {
      document.removeEventListener('visibilitychange', docVisibilityChangeCallback)
    }
  })
}
