/**
 * 获取 STS token 的响应
 */
export interface OSSResponse {
  request_id: string
  access_key_id: string
  access_key_secret: string
  security_token: string
  expiration: string
  bucket: string
  endpoint: string
  authorized_path: string
}

interface StorageInfo {
  /**
   * 用户上传的数据版本
   */
  dataVersion?: string

  /**
   * 上传后的存储位置
   */
  clusterStorageLocation: 'none' | 'temp' | 'weka' | '3fs'

  /**
   * nfs 暂存位置
   */

  nfsHostPath: string

  /**
   * 该数据集在weka/3fs的host路径
   */
  clusterHostPath?: string
}

// 数据集类型
export interface DatasetItem {
  /**
   * 数据集类型，公开或者私有
   */
  type: 'public' | 'private'

  /**
   * 后端用的属性，软屏蔽用
   */
  hidden: boolean

  /**
   * 该数据集归属的用户名或者组名，公开数据集可以没有此属性
   */
  owner?: string[]

  /**
   *  比如 CIFAR100
   */
  name: string

  /**
   * 数据集的标签，像 Images, Public, ...
   */
  tags: string[]

  /**
   * 一行简短说明
   */
  desc: string

  /**
   * 更新时间 YYMMDD HH:mm
   */
  updatedAt: string

  /**
   * hfai.dataset api 接口，比如
   * hfai.datasets.CIFAR100
   */
  datasetApi?: string

  /**
   * 该数据集是否是 FFR 格式
   */
  isFFRFormat: boolean

  /**
   * 是否提供 FFR 转换工具：提供/开发中/不需要 (比如超小型数据集)/使用其他转换 (比如私有数据集)
   */
  FFRConverter: 'provide' | 'developing' | 'noNeed' | 'useOther'

  /**
   * 使用的 FFR 转换器，当 FFRConverter 为 useOther 时生效，填对应数据集名称
   */
  usedFFRConverter?: string

  /**
   * 数据集大小，不需要很精确，xxGB, xxMB
   */
  size?: string

  /**
   * 数据集状态
   */
  status: '待上传' | '可用' | '沟通中' | '开发中' | '废弃'

  /**
   * 数据集在集群端可访问的路径，比如 /public_dataset/1/ffdataset/CIFAR/....
   */
  clusterPath?: string

  details: {
    /**
     * 数据集简介，markdown 格式
     */
    overview: string

    /**
     * demo 示例代码，markdown 格式
     */
    demo?: string

    /**
     * ffrecord convert 操作教程，markdown 格式
     */
    convert?: string

    /**
     * 私有数据集上传，markdown 格式
     */
    upload?: string

    /**
     * mini 数据集下载，方便本地测试，markdown 格式
     */
    download?: string
  }

  // 下面这三个可以单纯放后端用
  /**
   *如何转换为 FFRecord, useOther，使用其他现成的 converter, custom 联系定制，noNeed 暂不转换
   */
  howToConvertFFR?: 'useOther' | 'custom' | 'noNeed'

  /**
   * 上传的文件名
   */
  uploadFileName?: string

  /**
   * 上传的文件，是 form 提交还是转 base64 发 json 待定
   */
  uploadFile?: any

  /**
   * 用户是否可用上传
   */
  canUserUpload: boolean

  /**
   * 私有数据集上传相关 OSS 配置
   */
  stsTokenInfo?: OSSResponse

  /**
   * 私有数据集的挂载信息等
   */
  storageInfo?: StorageInfo
}

/**
 * 提交表单的参数
 */
export interface CreatePrivateDatasetSettings {
  /**
   *  比如 CIFAR100
   */
  name: string

  /**
   * 数据集的标签，像 Images, Public, ...
   */
  tags: string[]

  /**
   * 一行简短说明
   */
  desc: string

  /**
   * 摘要
   */
  overview: string

  /**
   * 预估大小
   */
  size: string

  /**
   *如何转换为 FFRecord, useOther，使用其他现成的 converter, custom 联系定制，noNeed 暂不转换
   */
  howToConvertFFR: 'useOther' | 'custom' | 'noNeed'

  /**
   * 使用已有的 FFR 转换器，填对应数据集名称
   */
  usedFFRConverter?: string

  /**
   * 上传的文件名
   */
  uploadFileName?: string

  /**
   * 上传的文件，是 form 提交还是转 base64 发 json 待定
   */
  uploadFile?: any
}

export type DatasetJob = {
  datasetId: string
  dataVersion?: string
  stageId: string
  status: 'running' | 'finished' | 'failed'
  createdAt: string
  finishedAt?: string
  meta: DatasetJobMeta
}

export interface UgcDownloadJobMeta {
  jobType: 'ugcJob'
  taskType: 'oss_download'
  user: string
  datasetName: string
  index: string
}

export interface UgcCloneJobMeta {
  jobType: 'ugcJob'
  taskType: 'clone_downloaded'
  datasetName: string
  src_path: string
  dst_path: string
  delegate_user?: string
}

export type DatasetJobMeta = UgcDownloadJobMeta | UgcCloneJobMeta
