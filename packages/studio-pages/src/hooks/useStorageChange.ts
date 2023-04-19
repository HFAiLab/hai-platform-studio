import useEffectOnce from 'react-use/esm/useEffectOnce'

export const useStorageChange = (callback: (e: StorageEvent) => any) => {
  useEffectOnce(() => {
    function docVisibilityChangeCallback(e: StorageEvent) {
      callback(e)
    }
    window.addEventListener('storage', docVisibilityChangeCallback)
    return () => {
      window.removeEventListener('storage', docVisibilityChangeCallback)
    }
  })
}
