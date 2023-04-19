import QueryString from 'qs'

// hash 路由模式下获取 searchParam
const getHashSearchParams = (url: string) => {
  const hash = (url.split('#')[1] || '').split('?')[1] || ''
  return QueryString.parse(hash)
}

// 替换 HashRouter url 中的 SearchParams
const replaceUrlHashSearchParams = (url: string, params: Record<string, any>): string => {
  // 注意：URL 规范里，hash 应该在 query 之后
  // 如果用原生的 location.hash，会把#之后内容全部放进去

  // url = http://a.com/path#/hash_path?arg1=value&arg2=value2

  // withoutHash = http://a.com/path
  const withoutHash = url.split('#')[0]

  // hash = #/hash_path?arg1=value&arg2=value2
  const hash = `#${url.split('#')[1] ?? '/'}`

  // hashPath = #/hash_path
  const hashPath = hash.split('?')[0]

  let query = QueryString.stringify(params, { arrayFormat: 'repeat' })
  if (query) {
    query = `?${query}`
  }
  return `${withoutHash}${hashPath}${query}`
}

// 新增或替换一个参数在 url 中
export const replaceOrAddSingleSearchParam = (url: string, key: string, value: string): string => {
  const withoutHash = url.split('#')[0]

  // hash = #/hash_path?arg1=value&arg2=value2
  const hash = `#${url.split('#')[1] ?? '/'}`

  const params = getHashSearchParams(url)

  params[key] = value

  if (!value) {
    delete params[key]
  }

  const hashPath = hash.split('?')[0]

  let query = QueryString.stringify(params, { arrayFormat: 'repeat' })
  if (query) {
    query = `?${query}`
  }
  return `${withoutHash}${hashPath}${query}`
}

// 改变当前 url
export const setUrl = (url: string, redirect: boolean) => {
  if (redirect) {
    // 如果只改变 hash 部分不会造成页面刷新，但是 react-router 有响应
    window.location.href = url
  } else {
    // 这里不会引起 react-router 的响应
    window.history.replaceState({}, '', url)
  }
}

// http://a.com/path#/hash_path?arg1=value&arg2=value2  => /hash_path
export const getHashRoutePath = (url?: string) => {
  const u = url || window.location.href
  return (u.split('#')[1] || '').split('?')[0]
}

type ConvertResultType = undefined | string | number | boolean
export const getHashedSearch = (option: {
  defaultValues: Record<string, any>
  selectedFields?: string[]
}) => {
  const { defaultValues, selectedFields } = option
  const url = window.location.href
  const params = getHashSearchParams(url)
  function convert(v: string | Array<string>): ConvertResultType | ConvertResultType[] {
    if (typeof v === 'string') {
      let converted
      switch (v) {
        case 'true':
          converted = true
          break
        case 'false':
          converted = false
          break
        case 'null':
        case 'undefined':
          converted = undefined
          break
        default:
          converted = v
      }
      return converted
    }
    if (Array.isArray(v)) {
      return v.map((item) => convert(item)) as ConvertResultType[]
    }
    return undefined
  }

  const converted = {} as Record<string, any>
  // 只把默认值里面有的参数进行一个转换
  // 后面如果进行参数废弃，直接默认值里面换一个属性就行了
  // hint: 参数写回的时候，实际上也应该只处理默认值里面有的参数，这个后面讨论一下
  for (const key in defaultValues) {
    if ((selectedFields && !selectedFields.includes(key)) || !params[key]) {
      continue
    }

    const convertedValue = convert(params[key] as string | string[])

    switch (typeof defaultValues[key]) {
      case 'number':
        converted[key] = Number(convertedValue)
        if (Number.isNaN(converted[key])) delete converted[key]
        break
      case 'boolean':
        converted[key] = !!convertedValue // 兼容了 0、1
        break
      case 'string': // 写了一个数字，
      default:
        converted[key] = convertedValue
    }

    // hint: 目前这里针对数组的处理是有类型风险的
    // FIXME: 这里需要考虑更安全的写法
    if (Array.isArray(defaultValues[key]) && !Array.isArray(converted[key])) {
      converted[key] = [converted[key]]
    }
  }
  return { ...defaultValues, ...converted }
}

export const setHashedSearch = (params: Record<string, any>, redirect = false) => {
  const url = window.location.href
  setUrl(replaceUrlHashSearchParams(url, params), redirect)
}

export const clearHashedSearch = () => {
  setHashedSearch({}, false)
}
