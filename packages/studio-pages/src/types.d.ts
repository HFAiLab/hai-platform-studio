export {}

declare module '*.json' {
  const value: any
  export default value
}

declare module '*.svg' {
  const value: any
  export default value
}

declare module '*.png' {
  const value: any
  export default value
}

declare module '*jpg' {
  const value: any
  export default value
}

declare global {
  interface Window {
    _hf_user_if_in: boolean
    _select_chain_sync_init: boolean
    is_hai_studio: boolean
  }
}
