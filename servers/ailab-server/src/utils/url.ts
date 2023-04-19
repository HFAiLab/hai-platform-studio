export function appendQuery(uri: string, key: string, value: string) {
  if (!value) {
    return uri
  }
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'
  if (uri.match(re)) {
    return uri.replace(re, `$1${key}=${value}$2`)
  }
  return `${uri + separator + key}=${value}`
}

export function skipToken(obj: string | object) {
  if (typeof obj === 'string') {
    return obj
      .replace(/token=(.{3})(.*?)(\\s|&|$)/g, 'token=$1***$3')
      .replace(/"token":"(.{3})(.*?)"/, '"token":"$1***"')
      .replace(/get_worker_user_info\/(.{3})(.*?)(\/|$)/, 'get_worker_user_info/$1***$3')
      .replace(/cancel_queue_api\/(.{3})(.*?)(\/|$)/, 'cancel_queue_api/$1***$3')
      .replace(/set_user_gpu_quota\/(.{3})(.*?)(\/|$)/, 'set_user_gpu_quota/$1***$3')
      .replace(/get_user_info\/(.{3})(.*?)(\/|$)/, 'get_user_info/$1***$3')
      .replace(
        /get_lifecycle_from_chain_id_api\/(.{3})(.*?)(\/|$)/,
        'get_lifecycle_from_chain_id_api/$1***$3',
      )
  }
  if (typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'token')) {
    ;(obj as { token: string }).token = `${`${(obj as { token: string }).token}`.slice(0, 3)}***`
  }
  return obj
}
