import type { AilabServerClient } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { GetTrainImagesResult } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type {
  IClusterInfoUsage,
  IQuotaMap,
  TaskConfigJsonTraining,
  TaskCreateYamlSchemaV2,
  TrainImageInfo,
  TrainingTask,
  UserImageInfo,
} from '@hai-platform/shared'
import {
  DefaultFFFSFuse,
  DefaultSideCar,
  TaskPriority,
  convertFuseValueToSubmit,
  getDefaultMountInfo,
  getDefaultTrainingGroup,
  getFuseValueFromRemote,
  getMountCode,
  isBackgroundTask,
  priorityToName,
  taskToSchemaV2,
} from '@hai-platform/shared'
import { CONSTS } from '../../../consts'
import minimist from '../../../deps/minimist'
import { convertParamsToList } from '../../../deps/minimist/convertParams'
import type { Chain } from '../../../model/Chain'
import {
  InnerPriorityValues,
  OuterPriorityValues,
  SUBMIT_PRIORITY_LIST,
} from '../../../model/TaskCreateSettings'
import type { HaiEnvItem, PriorityInfo } from '../schema'
import type { Exp2CreateParams } from '../schema/params'
import { Exp2SubmitConfig } from '../widgets/submit/config'
import { UserHelper } from './UserHelper'

export interface IEnv {
  name: string
  value: string
}

export interface IImage extends IEnv {
  default?: boolean
  // 渲染用
  key: string
  verInfo?: string
}

export interface EnvSchemaForDisplay {
  name: string
  value: string
  key: string
  pyVer?: string
  isDivider?: boolean
  type: 'H1' | 'H2' | 'normal' | 'leaf' | 'lastLeaf'
}

export type IImageList = Array<IImage>

export interface IImageGroupList {
  mars: IImageList
  user: IImageList
}

export interface IImageListInfo {
  imgList: IImageGroupList
  imgListForSelect: (string | IImage)[]
}

// 这个类里面应该都是静态的 static 方法
export class ExperimentHelper {
  static getDefaultCreateParams = (options: {
    chain: Chain | null
    maybeCreatedWithJupyter?: (chain: Chain) => boolean // from service
    getServerRoot?: () => string // from service
  }): Exp2CreateParams => {
    const ifInner = window._hf_user_if_in

    // 有 Chain 的情况下，以 Chain 的为准，相当于一个记忆功能
    // 没有 Chain 的情况下，默认的

    let group = getDefaultTrainingGroup()
    let worker = 1
    let priority = ifInner
      ? CONSTS.DEFAULT_PRIORITY_VALUE_INTERNAL
      : CONSTS.DEFAULT_PRIORITY_VALUE_EXTERNAL
    let image = 'default'
    let directory = CONSTS.WORKSPACE_ROOT_STR
    let whole_life_state = 0
    let mount_extra = getDefaultMountInfo()
    let py_venv = Exp2SubmitConfig.VENV_NOT_SET_HOLDER
    let envs = [['', '']] as [string, string][]
    let parameters = [] as string[]
    let tags = [] as string[]
    let watchdog_time = 0
    let sidecar = DefaultSideCar
    let fffs_enable_fuse = getFuseValueFromRemote(DefaultFFFSFuse)

    if (options.chain) {
      const { chain } = options
      const config_json = chain.config_json as TaskConfigJsonTraining

      /**
       * 注意：展示的时候，ChainDelayGroupRegex 可能会影响正在运行的任务的 group 展示
       */
      group =
        config_json && config_json.client_group
          ? `${config_json.client_group}`
          : chain.group.replace(CONSTS.ChainDelayGroupRegex, '')
      worker = chain.nodes
      // 外部用户锁死优先级为 auto
      // 对于历史提交任务来说，实际上外部用户不展示优先级了，model 层改成 auto，没什么问题
      // eslint-disable-next-line no-nested-ternary
      priority = ifInner
        ? config_json
          ? config_json.schema?.priority ?? (config_json.priority as number) ?? chain.priority
          : chain.priority
        : TaskPriority.AUTO
      image = config_json.train_image || chain.backend // 自定义镜像优先是从 train_image 中获取的

      if (options.maybeCreatedWithJupyter && options.maybeCreatedWithJupyter(chain)) {
        const root = options.getServerRoot ? options.getServerRoot() : ''
        directory = chain.workspace.slice(root.length) || CONSTS.WORKSPACE_ROOT_STR
      } else {
        directory = chain.workspace
      }

      whole_life_state = config_json ? config_json.whole_life_state ?? 0 : 0

      mount_extra = chain.getMountSetting()

      envs = Object.keys(config_json.environments || {}).map((key) => [
        key,
        config_json.environments[key]!,
      ]) as Array<[string, string]>

      if (config_json.schema?.options?.py_venv) {
        py_venv = config_json.schema.options.py_venv
      }

      if (config_json.environments && config_json.environments.HF_ENV_NAME) {
        envs = envs.filter((item) => {
          return !['HF_ENV_NAME', 'HF_ENV_OWNER'].includes(item[0]!)
        })
      }

      const rawParameters = chain.code_file.trim().split(' ').slice(1)
      const parsedParameters = minimist(rawParameters)
      parameters = convertParamsToList(parsedParameters)

      tags = chain.tags || []
      watchdog_time = config_json.schema?.options?.watchdog_time ?? 0

      const configJsonSidecar = config_json.schema?.options?.sidecar || []
      sidecar =
        typeof configJsonSidecar === 'string' ? configJsonSidecar.split(',') : configJsonSidecar
      fffs_enable_fuse = getFuseValueFromRemote(
        'fffs_enable_fuse' in (config_json.schema?.options || {})
          ? config_json.schema?.options?.fffs_enable_fuse
          : DefaultFFFSFuse,
      )
    }

    return {
      group,
      worker,
      priority,
      image,
      directory,
      whole_life_state,
      mount_extra,
      py_venv,
      envs,
      parameters,
      tags,
      watchdog_time,
      sidecar,
      fffs_enable_fuse,
    }
  }

  static getPriorityList = (): Array<PriorityInfo> => {
    let priorityList = []

    const priorityValueList = window._hf_user_if_in ? InnerPriorityValues : OuterPriorityValues
    const priorityItemOkList = SUBMIT_PRIORITY_LIST.filter((p) => {
      return priorityValueList.includes(p.value)
    })

    priorityList = [...priorityItemOkList]

    return priorityList
  }

  private static getImageValueFromUserImageInfo(image: UserImageInfo) {
    return `${image.registry}/${image.shared_group}/${image.image}`
  }

  private static getEnvGroupListFromImages = (images: GetTrainImagesResult): IImageGroupList => {
    const defaultEnv = images.mars_images[0]?.env_name

    const getVerInfo = (image: TrainImageInfo) => {
      const pattern = /python(\d*.\d)*/g
      const match = pattern.exec(image.config?.python)
      const pyVer = match?.[1]
      const cudaVer = image.config?.cuda?.replace('cuda', 'cu')
      if (pyVer) {
        return `py${pyVer}${cudaVer ? `_${cudaVer}` : ''}`
      }
      return undefined
    }
    return {
      mars: images.mars_images.map((image) => {
        return {
          name: image.env_name,
          value: image.env_name,
          default: image.env_name === defaultEnv,
          key: image.env_name,
          verInfo: getVerInfo(image),
        }
      }),
      user: images.user_images
        .filter((image) => {
          return image.status === 'loaded' && image.image
        })
        .map((image) => {
          return {
            name: image.image,
            value: ExperimentHelper.getImageValueFromUserImageInfo(image),
            default: false,
            key: image.updated_at,
          }
        }),
    }
  }

  private static ifImageInCurrentImageInfo = (options: {
    sourceTrainImages: GetTrainImagesResult | null
    imageValue: string
  }) => {
    return (
      options.imageValue === 'default' ||
      (options?.sourceTrainImages?.mars_images || []).find(
        (item) => item.env_name === options.imageValue,
      ) ||
      (options?.sourceTrainImages?.user_images || []).find(
        (item) => ExperimentHelper.getImageValueFromUserImageInfo(item) === options.imageValue,
      )
    )
  }

  private static getDefaultImage = (options: { sourceTrainImages: GetTrainImagesResult }) => {
    return options.sourceTrainImages.mars_images[0]?.env_name
  }

  // 获取下拉需要的 Image 信息
  static getImageListInfo = (options: {
    sourceTrainImages: GetTrainImagesResult | null
    imageValue: string
  }): IImageListInfo => {
    if (!options.sourceTrainImages) {
      return {
        imgList: {
          mars: [],
          user: [],
        },
        imgListForSelect: [],
      }
    }

    const imgList = ExperimentHelper.getEnvGroupListFromImages(options.sourceTrainImages!)

    const getImageGroupListForSelect = () => {
      let res: (string | IImage)[] = []
      if (imgList.mars.length) {
        res.push('mars')
        res = res.concat(imgList.mars || [])
      }
      if (imgList.user.length) {
        res.push('user')
        res = res.concat(imgList.user || [])
      }
      return res
    }

    return {
      imgList,
      imgListForSelect: getImageGroupListForSelect(),
    }
  }

  // 根据当前的 imageValue 和 hf_env 推断出 env 列表
  static getHFEnvList = (options: {
    sourceTrainImages: GetTrainImagesResult | null
    imageValue: string
    hf_env: string
  }): IEnv[] => {
    // 找到当前 image 的信息。这里先查系统的，后查用户自定义的，逻辑不同
    let imageInfo: TrainImageInfo | UserImageInfo | undefined =
      options.imageValue === 'default'
        ? options.sourceTrainImages?.mars_images[0]
        : options.sourceTrainImages?.mars_images.find(
            (item) => item.env_name === options.imageValue,
          )
    let hf_envs: string[] = []
    if (imageInfo) {
      // 发行版本可能没有
      hf_envs = imageInfo.config.hf_envs || []
    } else {
      imageInfo = options.sourceTrainImages?.user_images.find(
        (item) => ExperimentHelper.getImageValueFromUserImageInfo(item) === options.imageValue,
      )
    }

    if (!imageInfo) {
      return []
    }

    // NOT_SET 放到第一位，作为 fallback
    const currentEnvListWithNotSet = () => {
      return hf_envs.map((i) => {
        return { name: i, value: i }
      })
    }

    return currentEnvListWithNotSet()
  }

  // 获取镜像自带的一些环境变量
  static getImageDefaultEnvironments = (options: {
    sourceTrainImages: GetTrainImagesResult | null
    imageValue: string
  }): Record<string, string> => {
    const imageRealName =
      options.imageValue === 'default'
        ? options.sourceTrainImages?.mars_images[0]?.env_name
        : options.imageValue

    const imageInfo = options.sourceTrainImages?.mars_images.find(
      (item) => item.env_name === imageRealName,
    )

    if (!imageInfo) {
      // 自定义镜像目前没有环境变量，直接返回即可
      return {}
    }

    return imageInfo.config.environments
  }

  // 将参数转化成要提交的格式，step1，这一阶段主要做得实参数校验和规范化
  static convertToParams(options: {
    submitParams: Exp2CreateParams | null
    sourceClusterUsage: Array<IClusterInfoUsage>
    sourceTrainImages: GetTrainImagesResult | null
  }) {
    const { submitParams, sourceClusterUsage, sourceTrainImages } = options

    if (!sourceTrainImages) {
      throw new Error('unexpected error: failed to get image list')
    }

    if (!submitParams) throw new Error('no params')
    if (
      window._hf_user_if_in &&
      (!submitParams.group || submitParams.group === CONSTS.INVALID_GROUP)
    ) {
      throw new Error(i18n.t(i18nKeys.biz_create_not_valid_group))
    }

    if (window._hf_user_if_in) {
      const groupItem = sourceClusterUsage.find(
        (i: { group: string }) => i.group === submitParams.group,
      )
      if (!groupItem) {
        throw new Error(i18n.t(i18nKeys.biz_create_not_valid_group))
      } else if (groupItem.show.includes(i18n.t(i18nKeys.base_inv))) {
        // 无效分组分组
        throw new Error(i18n.t(i18nKeys.biz_create_not_valid_group))
      }
    }

    if (!submitParams.image) {
      throw new Error(i18n.t(i18nKeys.biz_create_not_valid_image, { more_msg: 'image empty' }))
    }

    if (
      !ExperimentHelper.ifImageInCurrentImageInfo({
        sourceTrainImages,
        imageValue: submitParams.image,
      })
    )
      throw new Error(i18n.t(i18nKeys.biz_create_not_valid_image, { more_msg: 'envItem invalid' }))

    if (+submitParams.worker < 1) {
      throw new Error(i18n.t(i18nKeys.biz_create_worker_lt_1))
    }

    let dir = submitParams.directory ?? ''
    if (dir === CONSTS.WORKSPACE_ROOT_STR) {
      dir = ''
    }
    if (dir.startsWith('/')) {
      throw new Error(
        `${dir} can not be used as an directory to submit a task, please select \`workspace\` again.`,
      )
    }

    let priority = window._hf_user_if_in ? Number(submitParams.priority) : TaskPriority.AUTO
    const isCurrentBackgroundTask = isBackgroundTask(submitParams.group)

    if (window._hf_user_if_in && !isCurrentBackgroundTask) {
      // 内部用户，非 background task 的时候检查
      if (Number.isNaN(priority) || !priority) {
        throw new Error(i18n.t(i18nKeys.biz_create_no_priority))
      } else if (!InnerPriorityValues.includes(priority)) {
        throw new Error(i18n.t(i18nKeys.biz_create_priority_not_expect))
      }
    }

    // 转义部分：
    let mount_code: number
    if (window._hf_user_if_in) {
      mount_code = getMountCode(submitParams.mount_extra)
    }

    if (isCurrentBackgroundTask) {
      priority = TaskPriority.AUTO
    }

    const envs = submitParams.envs
      .filter((env) => !!env[0])
      .reduce((curr, next) => {
        // eslint-disable-next-line prefer-destructuring
        curr[next[0]] = next[1]
        return curr
      }, {} as Record<string, string>)

    return {
      container:
        submitParams.image === 'default' // 这里我们还是不传 default，因为 default 体验不好，其实实际上并不知道是哪个
          ? ExperimentHelper.getDefaultImage({
              sourceTrainImages,
            }) || submitParams.image
          : submitParams.image,
      py_venv:
        submitParams.py_venv === Exp2SubmitConfig.VENV_NOT_SET_HOLDER
          ? undefined
          : submitParams.py_venv,
      parameters: submitParams.parameters.join(' '),
      directory: dir,
      restart_job: true as const,
      priority,
      environments: envs,
      whole_life_state: Number(submitParams.whole_life_state),
      groups: [
        {
          group: window._hf_user_if_in ? submitParams.group : '',
          node_count: submitParams.worker,
        },
      ] as [{ group: string; node_count: number }],
      mount_code: mount_code!,
      tags: submitParams.tags.length ? submitParams.tags : undefined,
      watchdog_time: submitParams.watchdog_time || undefined,
      sidecar: submitParams.sidecar || [],
      fffs_enable_fuse: convertFuseValueToSubmit(submitParams.fffs_enable_fuse),
    }
  }

  // 获取 Chain 对应的类似提交的 Schema，以对象形式
  static getChainYamlSchema = (options: { chain: Chain }): TaskCreateYamlSchemaV2 => {
    const chainSchema = (options.chain.config_json as TaskConfigJsonTraining).schema
    if (chainSchema) return chainSchema
    return taskToSchemaV2(options.chain as unknown as TrainingTask)
  }

  static getChainYamlString = (options: {
    schemaValue: TaskCreateYamlSchemaV2
    ailabServerClient: AilabServerClient
  }) => {
    return options.ailabServerClient
      .request(AilabServerApiName.YAML_STRINGIFY, undefined, {
        data: {
          content: options.schemaValue as unknown as Record<string, unknown>,
        },
      })
      .then((yaml) => {
        return yaml.results
      })
  }

  static getMaxWorker = (options: {
    priority: number
    group: string
    sourceQuotaMap: IQuotaMap | null
  }) => {
    if (!options.sourceQuotaMap) return -1
    const currentPriorityName = priorityToName(options.priority)
    const maxWorker = UserHelper.getQuota({
      group: options.group,
      sourceQuotaMap: options.sourceQuotaMap,
      priorityName: currentPriorityName,
    })
    return maxWorker
  }

  // 把镜像里的 env 信息和 haiEnv 信息合并，直接用于列表展示
  static combineEnvList = (options: {
    sysList: IEnv[]
    ownList: HaiEnvItem[]
    othersList: HaiEnvItem[]
    filterQuery?: string
  }): EnvSchemaForDisplay[] => {
    const { sysList, ownList, othersList, filterQuery } = options
    let kw = ''
    if (filterQuery) {
      kw = filterQuery.toLowerCase()
    }

    const getGrouped = (envs: HaiEnvItem[], h1: string) => {
      const ret = [] as EnvSchemaForDisplay[]
      const extendDict = {} as Record<string, HaiEnvItem[]>
      for (const env of envs) {
        const extend = env.extend_env || 'No Extend'
        if (!extendDict[extend]) {
          extendDict[extend] = []
        }
        extendDict[extend]!.push(env)
      }
      let seq = Object.keys(extendDict).sort()
      if (seq.includes('No Extend')) {
        seq = seq.filter((i) => i !== 'No Extend')
        seq.push('No Extend')
      }
      // 打个 H1 进去
      ret.push({
        key: `h1-${h1}`,
        name: h1,
        type: 'H1',
        value: h1,
        isDivider: true,
      })

      for (const ext of seq) {
        ret.push({
          key: `${h1}-h2-${ext}`,
          name: ext === 'No Extend' ? ext : `Extend ${ext}`,
          value: ext,
          type: 'H2',
          isDivider: true,
        })
        const leaf = extendDict[ext]!
        for (const e of leaf) {
          ret.push({
            name: e.haienv_name,
            value: `${e.haienv_name}[${e.user}]`,
            key: `${e.haienv_name}[${e.user}]`,
            isDivider: false,
            pyVer: e.py,
            type: 'leaf',
          })
        }
        ret[ret.length - 1]!.type = 'lastLeaf'
      }
      return ret
    }

    let ret = [] as EnvSchemaForDisplay[]
    // 无论如何先放入 NOT_SET
    ret.push({
      name: Exp2SubmitConfig.VENV_NOT_SET_HOLDER,
      value: Exp2SubmitConfig.VENV_NOT_SET_HOLDER,
      key: Exp2SubmitConfig.VENV_NOT_SET_HOLDER,
      isDivider: false,
      type: 'normal',
    })

    const filterFuncIEnv = (i: IEnv) => {
      return `${i.name.toLowerCase()}`.includes(kw)
    }
    const filterFuncHaiEnvItem = (i: HaiEnvItem) => {
      return `${i.haienv_name},${i.extend_env ?? ''},${i.py},${i.user}`.toLowerCase().includes(kw)
    }
    const sysListFiltered = kw ? sysList.filter(filterFuncIEnv) : sysList
    const ownListFiltered = kw ? ownList.filter(filterFuncHaiEnvItem) : ownList
    const othersListFiltered = kw ? othersList.filter(filterFuncHaiEnvItem) : othersList
    if (sysListFiltered.length) {
      ret.push({
        name: 'System Env',
        value: 'System Env',
        key: 'System Env',
        isDivider: true,
        type: 'H1',
      })
      for (const sysEnv of sysListFiltered) {
        ret.push({
          name: sysEnv.name,
          value: sysEnv.value,
          key: `${sysEnv.name}-systemEnv`,
          isDivider: false,
          type: 'normal',
        })
      }
    }
    if (ownListFiltered.length) {
      const r = getGrouped(ownListFiltered, 'My Env')
      ret = ret.concat(r)
    }
    if (othersListFiltered.length) {
      const r = getGrouped(othersListFiltered, 'Others Env')
      ret = ret.concat(r)
    }

    return ret
  }
}
