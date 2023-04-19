declare global {
  interface Window {
    _hf_user_if_in: boolean
  }
}

export function isInnerUser() {
  return window._hf_user_if_in
}
