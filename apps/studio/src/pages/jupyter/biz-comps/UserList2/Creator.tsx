/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { ServiceTaskTasksApiResult } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type {
  BuiltinServiceListType,
  ContainerServicePortType,
  ContainerServiceType,
  ContainerTask,
  CreateTaskService,
  MixService,
  MountCodeInfoMap,
  MountInfo,
  ServiceTaskCreateV2Schema,
} from '@hai-platform/shared'
import {
  BuiltinServiceList,
  BuiltinServiceListExternal,
  DefaultFFFSFuse,
  DefaultSideCar,
  FuseOptions,
  SidecarInfoMap,
  convertFuseValueToSubmit,
  getDefaultJupyterGroupPrefixRegex,
  getDefaultMountInfo,
  getDefaultTrainingGroupRegex,
  getFuseValueFromRemote,
  getMountCode,
  getMountInfoFromCode,
  ifUserShowFuse,
  ifUserShowSideCar,
  mountCodeInfoMap,
} from '@hai-platform/shared'
import { HFLoading } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import { Collapse as BizCollapse } from '@hai-platform/studio-pages/lib/ui-components/uikit/collapse/index'
import { getNameSpace } from '@hai-platform/studio-pages/lib/utils/theme'
import {
  Button,
  Callout,
  Checkbox,
  Label,
  MenuItem,
  Radio,
  RadioGroup,
  Slider,
  Switch,
} from '@hai-ui/core'
import { FormGroup } from '@hai-ui/core/lib/esm/components'
import { Select } from '@hai-ui/select'
import classNames from 'classnames'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { GrootStatus } from 'use-groot'
import { v4 as uuidv4 } from 'uuid'
import { GlobalApiServerClient } from '../../../../api/apiServer'
import { InputGroupWithCheck, NumericInputWithCheck } from '../../../../components/Input'
import { User } from '../../../../modules/user'
import { AppToaster } from '../../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { ContainerIcon } from '../utils'

import './Creator.scss'

const MIN_CPU = 1
const MIN_MEM = 1

export interface ContainerCreatorProps {
  data: ServiceTaskTasksApiResult | undefined
  invokeToList: () => void
  status: GrootStatus
  editContainer?: ContainerTask | null
  isCreatingSpotContainer?: boolean
}

export interface MixServiceListInfo {
  currentService: MixService
  isEditing: boolean
  uuid: string
}

interface CreateImplOptions {
  fastJupyter?: boolean
}

const getDefaultMixService = (editContainer?: ContainerTask | null) => {
  if (editContainer) {
    const mixServices: MixServiceListInfo[] = []

    ;(editContainer.config_json.schema?.services || ([] as CreateTaskService[])).forEach(
      (service: CreateTaskService) => {
        if ((BuiltinServiceList as unknown[] as string[]).includes(service.name)) {
          // 内置
          mixServices.push({
            uuid: uuidv4(),
            isEditing: false,
            currentService: {
              type: 'builtin',
              builtin_service: { name: service.name },
            } as MixService,
          })
        } else {
          // 非内置
          mixServices.push({
            uuid: uuidv4(),
            isEditing: false,
            currentService: {
              type: 'custom',
              custom_service: { ...service },
            } as MixService,
          })
        }
      },
    )
    return mixServices
  }
  if (window._hf_user_if_in) {
    return [
      {
        uuid: uuidv4(),
        isEditing: false,
        currentService: {
          type: 'builtin',
          builtin_service: {
            name: 'jupyter',
          },
        } as MixService,
      },
      {
        uuid: uuidv4(),
        isEditing: false,
        currentService: {
          type: 'builtin',
          builtin_service: {
            name: 'ssh',
          },
        } as MixService,
      },
    ]
  }
  return [
    {
      uuid: uuidv4(),
      isEditing: false,
      currentService: {
        type: 'builtin',
        builtin_service: {
          name: 'jupyter',
        },
      } as MixService,
    },
  ]
}

function judgeHasSameService(serviceList: MixServiceListInfo[]) {
  const names = new Set<string>()
  for (const service of serviceList) {
    if (service.currentService.type === 'builtin') {
      if (names.has(service.currentService.builtin_service!.name)) return true
      names.add(service.currentService.builtin_service!.name)
    } else if (service.currentService.type === 'custom') {
      if (names.has(service.currentService.custom_service!.name)) return true
      names.add(service.currentService.custom_service!.name)
    }
  }
  return false
}

const softDimension = 4

function getSoftValue(value: number, max: number) {
  return Math.ceil(value ** softDimension / max ** (softDimension - 1))
}

function getValueFromSoft(res: number, max: number) {
  return (res * max ** (softDimension - 1)) ** (1 / softDimension)
}

interface ContainerEnvOption {
  type: 'mars' | 'user'
  value: string
}

function getEnvOptions(
  data: ServiceTaskTasksApiResult | undefined,
): (ContainerEnvOption | string)[] {
  if (!data) return []
  const envList: (ContainerEnvOption | string)[] = []

  envList.push('mars')
  data.environments.forEach((env) => {
    envList.push({
      type: 'mars',
      value: env,
    })
  })

  envList.push('user')
  ;(data.hfai_images || []).forEach((image) => {
    envList.push({
      type: 'user',
      value: `${image.registry}/${image.shared_group}/${image.image}`,
    })
  })

  return envList
}

const ImageEnvSelect = Select.ofType<ContainerEnvOption | string>()

export const ContainerCreator = React.memo((props: ContainerCreatorProps) => {
  let groups = Object.keys(props.data?.quota || {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const environments = props.data?.environments || []
  const quota = props.data?.quota || {}

  const imageEnvs = getEnvOptions(props.data)

  const onlyForEdit = !!props.editContainer

  const isSpot = onlyForEdit
    ? !!props.editContainer?.config_json.schema.resource.is_spot
    : !!props.isCreatingSpotContainer

  if (isSpot) {
    // 只有外部用户才可能进入到这个逻辑
    if (props.data?.spot_jupyter_quota === 0) {
      groups = []
    } else {
      groups = groups.filter((group) => getDefaultTrainingGroupRegex().test(group))
    }
  } else if (props.data?.dedicated_jupyter_quota === 0) {
    // 独占的 quota 总数为 0 的话，我们就不显示非 shared 分组的机器了
    groups = groups.filter((group) => getDefaultJupyterGroupPrefixRegex().test(group))
  }

  // -------
  const [extraMounts, setExtraMounts] = useState(
    props.editContainer && props.editContainer?.config_json.schema?.options?.mount_code
      ? getMountInfoFromCode(props.editContainer.config_json.schema.options.mount_code)
      : getDefaultMountInfo(),
  )
  const [sideCar, setSideCar] = useState(
    props.editContainer && props.editContainer?.config_json.schema?.options?.sidecar
      ? props.editContainer.config_json.schema.options.sidecar
      : DefaultSideCar,
  )

  const [fffsEnableFuse, setFFFSEnableFuse] = useState<string>(
    props.editContainer
      ? getFuseValueFromRemote(
          'fffs_enable_fuse' in (props.editContainer?.config_json.schema?.options || {})
            ? props.editContainer?.config_json.schema?.options?.fffs_enable_fuse
            : DefaultFFFSFuse,
        )
      : getFuseValueFromRemote(DefaultFFFSFuse),
  )

  const [name, setName] = useState<string>(props.editContainer?.config_json.schema?.name || '')
  const [cpu, setCpu] = useState<number>(
    props.editContainer?.config_json?.schema?.resource.cpu || 2,
  )
  const [mem, setMem] = useState<number>(
    props.editContainer?.config_json?.schema?.resource.memory || 8,
  )
  const [selectGroup, setSelectGroup] = useState<string>(
    props.editContainer?.config_json.schema?.resource.group || groups[0]!,
  )
  const [memSliderValue, setMemSliderValue] = useState<number>(
    getValueFromSoft(
      mem,
      Math.min(quota[selectGroup]?.memory || 0, quota[selectGroup]?.allocatable || 0),
    ),
  )
  const [selectEnv, setSelectEnv] = useState<string>(
    props.editContainer?.config_json.schema?.resource.image ||
      props.editContainer?.backend ||
      environments[0]!,
  )

  const compatGroups = !groups.includes(selectGroup)
    ? [`(${i18n.t(i18nKeys.base_inv)})${selectGroup}`, ...groups]
    : groups

  // ------

  useEffect(() => {
    const currentSoftValue = getSoftValue(
      memSliderValue,
      Math.min(quota[selectGroup]?.memory || 0, quota[selectGroup]?.allocatable || 0),
    )
    if (currentSoftValue === mem) return
    const nextSliderValue = getValueFromSoft(
      mem,
      Math.min(quota[selectGroup]?.memory || 0, quota[selectGroup]?.allocatable || 0),
    )
    setMemSliderValue(nextSliderValue)
    // hint: currentSoftValue 不在依赖里面，因为它在回调函数中更新，它更新的同时会让 mem 一起更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mem, quota, selectGroup])

  const [currentServiceList, setCurrentServiceList] = useState<MixServiceListInfo[]>(
    getDefaultMixService(props.editContainer),
  )

  const createContainer = (options: CreateImplOptions) => {
    const createTaskV2Body: ServiceTaskCreateV2Schema = {
      name,
      version: 2,
      task_type: 'jupyter',
      resource: {
        image: selectEnv,
        group: selectGroup,
        cpu: getDefaultJupyterGroupPrefixRegex().test(selectGroup) ? cpu : 0,
        memory: getDefaultJupyterGroupPrefixRegex().test(selectGroup) ? mem : 0,
        is_spot: isSpot,
      },
      options: {
        mount_code: getMountCode(extraMounts),
        sidecar: sideCar,
        fffs_enable_fuse: convertFuseValueToSubmit(fffsEnableFuse),
      },
      services: [],
    }

    // hint: 这里只针对容器整体的配置进行校验就行了，具体的条目校验在条目保存的时候做
    if (!name) {
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_container_please_set_name),
        intent: 'danger',
      })
      return
    }

    if (
      getDefaultJupyterGroupPrefixRegex().test(selectGroup) &&
      (cpu < MIN_CPU || mem <= MIN_MEM)
    ) {
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_container_create_please_set_cpu_and_mem),
        intent: 'danger',
      })
      return
    }

    if (options.fastJupyter) {
      createTaskV2Body.services = [
        {
          name: 'jupyter',
        },
      ]
    } else {
      const ifSomeServiceEditing = !!currentServiceList.find((item) => item.isEditing)

      if (ifSomeServiceEditing) {
        AppToaster.show({
          message: i18n.t(i18nKeys.biz_container_please_save_edit_svc),
          intent: 'danger',
        })
        return
      }

      for (const iterService of currentServiceList) {
        if (iterService.currentService.type === 'builtin') {
          createTaskV2Body.services.push({
            name: iterService.currentService.builtin_service!.name,
          })
        }
        if (iterService.currentService.type === 'custom') {
          const custom_service = iterService.currentService.custom_service!
          const { name: serviceName, port, type, startup_script } = custom_service
          createTaskV2Body.services.push({
            name: serviceName,
            port,
            type,
            startup_script,
          })
        }
      }
    }

    AilabCountly.safeReport(CountlyEventKey.containerCreate)

    GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_CREATE_V2, undefined, {
      data: createTaskV2Body,
    })
      .then(() => {
        AppToaster.show({
          message: i18n.t(i18nKeys.biz_container_create_success),
          intent: 'success',
          icon: 'tick',
        })
        props.invokeToList()
      })
      .catch((e: any) => {
        AppToaster.show({
          message: `${e}`,
          intent: 'danger',
        })
      })
  }

  useEffect(() => {
    if (!selectGroup && groups.length) {
      setSelectGroup(groups[0]!)
    }
    if (!selectEnv && environments.length) {
      setSelectEnv(environments[0]!)
    }
  }, [groups, environments, selectGroup, selectEnv])

  useLayoutEffect(() => {
    AilabCountly.safeReport(CountlyEventKey.containerEnterCreator)
  }, [])

  if (!selectGroup) {
    return (
      <div className="container-creator-wrapper no-group-to-use">
        <p>{i18n.t(i18nKeys.biz_container_no_group_available)}</p>
      </div>
    )
  }
  if (!selectEnv) {
    return (
      <div className="container-creator-wrapper">
        {i18n.t(i18nKeys.biz_container_no_env_available)}
      </div>
    )
  }

  const addDefaultService = () => {
    const newServiceList: MixServiceListInfo[] = [
      ...currentServiceList,
      {
        uuid: uuidv4(),
        isEditing: true,
        currentService: {
          type: 'builtin',
          builtin_service: {
            name: 'jupyter',
            watch_state: false,
          },
        },
      },
    ]
    setCurrentServiceList(newServiceList)
  }

  const getQuotaShowText = (groupName: string): string => {
    const nameQuota = quota ? quota[groupName] : null
    if (!nameQuota) return ''

    return `${nameQuota.running} / ${nameQuota.quota}`
  }

  const currentMemMax = Math.min(
    quota[selectGroup]?.memory || 0,
    quota[selectGroup]?.allocatable || 0,
  )
  const currentCpuMax = Math.min(
    quota[selectGroup]?.cpu || 0,
    quota[selectGroup]?.max_cpu_core || 0,
  )

  const getPanelTitle = () => {
    if (!isSpot) {
      return onlyForEdit
        ? i18n.t(i18nKeys.biz_container_update_container)
        : i18n.t(i18nKeys.biz_container_create_container)
    }
    return onlyForEdit
      ? i18n.t(i18nKeys.biz_container_update_spot_container)
      : i18n.t(i18nKeys.biz_container_create_spot_container)
  }

  return (
    <div className="container-creator-wrapper hf">
      {(props.status === GrootStatus.init || props.status === GrootStatus.pending) && <HFLoading />}

      <h4 className="creator-part-title">{i18n.t(i18nKeys.biz_container_basic_info_config)}</h4>

      {isSpot && (
        <Callout className="spot-create-callout" intent="warning">
          {i18n.t(i18nKeys.biz_container_create_spot_container_tip)}
        </Callout>
      )}

      <div className="container-new-line">
        <FormGroup
          helperText={i18n.t(i18nKeys.biz_jupyter_create_name_limit)}
          label={i18n.t(i18nKeys.biz_container_name)}
        >
          <InputGroupWithCheck
            disabled={onlyForEdit}
            autoFocus={!onlyForEdit}
            value={`${name}`}
            onChange={(e) => {
              setName(e.target.value)
            }}
            checker={(value: string) => {
              if (!value) return true
              return /^[0-9a-z_-]{1,}$/.test(value)
            }}
          />
        </FormGroup>
      </div>
      <div className="container-new-line">
        <FormGroup label="Group">
          <div className={`${getNameSpace()}-html-select`}>
            <select
              name="group"
              value={selectGroup}
              onChange={(e) => {
                setSelectGroup(e.target.value)
              }}
              className="middle jupyter-new-select"
            >
              {compatGroups.map((i) => (
                <option key={i} value={i}>
                  {`${i} ${getQuotaShowText(i)}`}
                </option>
              ))}
            </select>
            <span
              className={`${getNameSpace()}-icon ${getNameSpace()}-icon-double-caret-vertical`}
            />
          </div>
        </FormGroup>
        <FormGroup label="Image">
          <ImageEnvSelect
            fill
            filterable={false}
            items={imageEnvs}
            // eslint-disable-next-line react/no-unstable-nested-components
            itemRenderer={(item: ContainerEnvOption | string, { handleClick }) => {
              if (typeof item === 'string') {
                let text = item
                if (item === 'mars') text = i18n.t(i18nKeys.biz_env_mars)
                if (item === 'user') text = i18n.t(i18nKeys.biz_env_user)
                return <div className="submit-settings-hf-create-classify">{text}</div>
              }

              return (
                <MenuItem
                  active={selectEnv === item.value}
                  key={`${item.value}`}
                  onClick={handleClick}
                  text={`${item.value}`}
                />
              )
            }}
            popoverProps={{ minimal: true }}
            onItemSelect={(item: ContainerEnvOption | string) => {
              setSelectEnv((item as ContainerEnvOption).value)
            }}
          >
            <Button
              rightIcon="caret-down"
              className="creator-env-btn"
              text={selectEnv}
              title={selectEnv}
            />
          </ImageEnvSelect>
        </FormGroup>
      </div>
      {getDefaultJupyterGroupPrefixRegex().test(selectGroup) && (
        <div className="container-new-line">
          <FormGroup
            label="CPU(core)"
            labelInfo={`${i18n.t(i18nKeys.biz_container_current_user_avail)}${
              quota[selectGroup]?.cpu
            }`}
            helperText={`${i18n.t(i18nKeys.biz_jupyter_group_max_cpu)} ${
              quota && quota[selectGroup] ? quota[selectGroup]?.max_cpu_core : 0
            }`}
          >
            <div className="number-input-with-slider">
              <div className="number-input-container">
                <NumericInputWithCheck
                  value={`${cpu}`}
                  fill
                  onValueChange={(value) => {
                    setCpu(Number(value))
                  }}
                  checker={(value: string | number) => {
                    return Number(value) >= MIN_CPU && Number(value) <= currentCpuMax
                  }}
                />
              </div>

              <div className="slider-container">
                <Slider
                  intent="primary"
                  // 这里之所以只 + 1，是为了当用户编辑的时候，当前可能并没有这么多可分配的了，这个时候可能会异常
                  value={cpu > currentCpuMax ? currentCpuMax + 1 : cpu}
                  min={MIN_CPU}
                  labelRenderer={(value) => {
                    if (value > currentCpuMax) return `${cpu}(>Max)`
                    if (value === currentCpuMax) return value.toString()
                    if (value === 1) return '1'
                    return cpu.toString()
                  }}
                  labelStepSize={Math.max(1, currentCpuMax - MIN_CPU)}
                  max={currentCpuMax}
                  onChange={(value) => {
                    setCpu(value)
                  }}
                />
              </div>
            </div>
          </FormGroup>
          <FormGroup
            label="Memory(G)"
            labelInfo={`${i18n.t(i18nKeys.biz_container_current_user_avail)}${
              quota[selectGroup]?.memory
            }`}
            helperText={`${i18n.t(i18nKeys.biz_jupyter_group_max_mem)} ${
              quota[selectGroup] ? quota[selectGroup]?.allocatable : 0
            }`}
          >
            <div className="number-input-with-slider">
              <div className="number-input-container">
                <NumericInputWithCheck
                  fill
                  value={`${mem}`}
                  onValueChange={(value) => {
                    setMem(Number(value))
                  }}
                  checker={(value: string | number) => {
                    return Number(value) >= MIN_MEM && Number(value) <= currentMemMax
                  }}
                />
              </div>
              <div className="slider-container">
                <Slider
                  // 这里之所以只 + 1，是为了当用户编辑的时候，当前可能并没有这么多可分配的了，这个时候可能会异常
                  value={memSliderValue > currentMemMax ? currentMemMax + 1 : memSliderValue}
                  intent="primary"
                  min={MIN_MEM}
                  stepSize={1}
                  labelRenderer={(value) => {
                    if (value > currentMemMax) return `${mem}(>Max)`
                    if (value === currentMemMax) return value.toString()
                    if (value === 1) return '1'
                    return mem.toString()
                  }}
                  labelStepSize={Math.max(1, currentMemMax - MIN_MEM)}
                  max={currentMemMax}
                  onChange={(value) => {
                    setMemSliderValue(value)
                    setMem(getSoftValue(value, currentMemMax))
                  }}
                />
              </div>
            </div>
          </FormGroup>
        </div>
      )}
      {window._hf_user_if_in && (
        <div className="container-new-line checkbox-inline-container">
          <Label className="checkbox-label">{i18n.t(i18nKeys.biz_container_extra_mounts)}</Label>
          {Object.keys(extraMounts).map((mountKey) => {
            return (
              <Checkbox
                inline
                label={mountCodeInfoMap[mountKey as keyof MountCodeInfoMap]?.alias}
                checked={extraMounts[mountKey as keyof MountInfo]}
                onChange={(e) => {
                  extraMounts[mountKey as keyof MountInfo] = (e.target as HTMLInputElement).checked
                  setExtraMounts({ ...extraMounts })
                }}
              />
            )
          })}
        </div>
      )}
      {ifUserShowSideCar(User.getInstance().userInfo?.group_list || []) && (
        <div className="container-new-line checkbox-inline-container">
          <Label className="checkbox-label">Sidecar</Label>
          {Object.entries(SidecarInfoMap).map(([value, info]) => {
            return (
              <Checkbox
                inline
                label={info.alias}
                checked={sideCar.includes(value)}
                onChange={() => {
                  setSideCar(
                    sideCar.includes(value)
                      ? sideCar.filter((curr) => curr !== value)
                      : [...sideCar, value],
                  )
                }}
              />
            )
          })}
        </div>
      )}
      {ifUserShowFuse(User.getInstance().userInfo?.group_list || []) && (
        <div className="container-new-line checkbox-inline-container">
          <Label className="checkbox-label">3FS Fuse</Label>
          <RadioGroup
            inline
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setFFFSEnableFuse((e.target as HTMLInputElement).value)
            }}
            selectedValue={fffsEnableFuse}
          >
            {FuseOptions.map(({ key, value }) => {
              return <Radio inline label={key} value={value} />
            })}
          </RadioGroup>
        </div>
      )}
      <h4 className="creator-part-title">{i18n.t(i18nKeys.biz_container_srvc_info_config)}</h4>
      <p className="creator-part-tip">{i18n.t(i18nKeys.biz_container_create_multi_tip)}</p>
      <div>
        {currentServiceList.map((service, index) => {
          return (
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            <CreatorServiceEditor
              isEditing={service.isEditing}
              currentService={service.currentService}
              // hint: 添加这样的一个 key，让我们可以复用组件，保存记录，否则可能乱掉
              key={service.uuid}
              onChange={(newService) => {
                const newCurrentServiceList = [...currentServiceList]
                newCurrentServiceList[index]!.currentService = newService
                setCurrentServiceList(newCurrentServiceList)
              }}
              onSave={() => {
                const newCurrentServiceList = [...currentServiceList]
                if (judgeHasSameService(newCurrentServiceList)) {
                  AppToaster.show({
                    message: '不允许有同名的服务',
                    intent: 'danger',
                  })
                  return
                }
                newCurrentServiceList[index]!.isEditing = false
                setCurrentServiceList(newCurrentServiceList)
              }}
              onDelete={() => {
                const newCurrentServiceList = [...currentServiceList]
                newCurrentServiceList.splice(index, 1)
                setCurrentServiceList(newCurrentServiceList)
              }}
              invokeEdit={() => {
                const newCurrentServiceList = [...currentServiceList]
                newCurrentServiceList[index]!.isEditing = true
                setCurrentServiceList(newCurrentServiceList)
              }}
            />
          )
        })}
      </div>

      <div className="creator-op-btns">
        <Button icon="plus" outlined className="adder-btn" onClick={addDefaultService}>
          {i18n.t(i18nKeys.biz_container_add_service_handle)}
        </Button>
        {/* 暂时内外部用户都不需要了 */}
        {/* {!currentServiceList.length && (
          <Button
            intent="primary"
            onClick={() => {
              createContainer({
                fastJupyter: true,
              })
            }}
          >
            {i18n.t(i18nKeys.biz_container_create_jupyter_fast)}
          </Button>
        )} */}
        {!!currentServiceList.length && (
          <Button
            large
            className={classNames('creator-btn', { 'spot-btn': isSpot })}
            intent="primary"
            onClick={() => {
              createContainer({})
            }}
          >
            {getPanelTitle()}
          </Button>
        )}
      </div>
    </div>
  )
})

interface CreatorServiceEditorProps {
  currentService: MixService
  isEditing: boolean
  onChange: (service: MixService) => void
  onSave: () => void
  onDelete: () => void
  invokeEdit: () => void
}

export const CreatorServiceEditor = (props: CreatorServiceEditorProps) => {
  const { currentService } = props
  const [currentSelectServiceType, setCurrentSelectServiceType] = useState<ContainerServiceType>(
    currentService.type,
  )
  // 感觉写成 ! 反而更安全一点
  const [currentSelectBuildInType, setCurrentSelectBuildInType] = useState<BuiltinServiceListType>(
    currentService.type === 'builtin' ? currentService.builtin_service!.name : 'jupyter',
  )
  const [currentExportCustomPort, setCurrentExportCustomPort] = useState(
    currentService.type === 'builtin' ? false : currentService.custom_service?.type !== 'local',
  )

  const [currentSelectCustomPortType, setCurrentSelectCustomPortType] =
    useState<ContainerServicePortType>(
      currentService.type === 'custom' ? currentService.custom_service?.type || 'http' : 'http',
    )
  const [currentSelectCustomPort, setCurrentSelectCustomPort] = useState(
    currentService.type === 'custom' ? currentService.custom_service!.port : 8000,
  )
  const [currentSelectCustomName, setCurrentSelectCustomName] = useState(
    currentService.type === 'custom' ? currentService.custom_service!.name : '',
  )
  const [currentSelectCustomStartScript, setCurrentSelectCustomStartScript] = useState(
    currentService.type === 'custom' ? currentService.custom_service!.startup_script : '',
  )
  const currentSelectIsBuildIn = currentSelectServiceType === 'builtin'

  const getServiceTypeShowText = (serviceType: ContainerServiceType): string => {
    if (serviceType === 'builtin') return i18n.t(i18nKeys.biz_container_builtin_service)
    if (serviceType === 'custom') return i18n.t(i18nKeys.biz_container_custom_service)
    return ''
  }

  const BuiltServicesToShow = window._hf_user_if_in
    ? BuiltinServiceList
    : BuiltinServiceListExternal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const invokeOnChange = () => {
    if (currentSelectServiceType === 'builtin') {
      const mixService: MixService = {
        type: 'builtin',
        builtin_service: {
          name: currentSelectBuildInType,
          watch_state: false,
        },
      }
      props.onChange(mixService)
    }

    if (currentSelectServiceType === 'custom') {
      const mixService: MixService = {
        type: 'custom',
        custom_service: {
          name: currentSelectCustomName,
          port: currentExportCustomPort ? currentSelectCustomPort : undefined,
          type: currentExportCustomPort ? currentSelectCustomPortType : 'local',
          startup_script: currentSelectCustomStartScript,
          watch_state: false,
        },
      }
      props.onChange(mixService)
    }
  }

  useEffect(() => {
    invokeOnChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentSelectServiceType,
    currentSelectBuildInType,
    currentSelectCustomPortType,
    currentSelectCustomPort,
    currentSelectCustomName,
    currentSelectCustomStartScript,
    currentExportCustomPort,
  ])

  const onSave = () => {
    if (currentSelectServiceType !== 'builtin' && !currentSelectCustomName) {
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_container_srvc_name_not_empty),
        intent: 'danger',
      })
      return
    }
    if (currentSelectServiceType !== 'builtin' && !currentSelectCustomStartScript) {
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_container_start_script_not_empty),
        intent: 'danger',
      })
      return
    }

    props.onSave()
  }

  if (!props.isEditing) {
    if (currentService.type === 'builtin' && currentService.builtin_service) {
      return (
        <div className="mix-service-container">
          <div className="mix-service-info-list">
            <div className="mix-service-info">
              <div className="info-name">{i18n.t(i18nKeys.base_name)}</div>
              <div className="info-value builtin" title={currentService.builtin_service.name}>
                <ContainerIcon type={currentService.builtin_service.name} />
                {currentService.builtin_service.name}
              </div>
            </div>
            <div className="mix-service-expand" />
            <div className="mix-service-op">
              <Button onClick={props.onDelete} intent="danger" outlined>
                {i18n.t(i18nKeys.base_delete)}
              </Button>
              <Button onClick={props.invokeEdit} outlined intent="primary">
                {i18n.t(i18nKeys.base_edit)}
              </Button>
            </div>
          </div>
        </div>
      )
    }
    if (currentService.type === 'custom' && currentService.custom_service) {
      return (
        <div className="mix-service-container">
          <div className="mix-service-info-list">
            <div className="mix-service-info">
              <div className="info-name">{i18n.t(i18nKeys.base_name)}</div>
              <div className="info-value">{currentService.custom_service.name}</div>
            </div>
            <div className="mix-service-info">
              <div className="info-value">
                {currentService.custom_service.type} / {currentService.custom_service.port}
              </div>
            </div>
            <div className="mix-service-expand" />
            <div className="mix-service-op">
              <Button intent="danger" outlined onClick={props.onDelete}>
                {i18n.t(i18nKeys.base_delete)}
              </Button>
              <Button outlined intent="primary" onClick={props.invokeEdit}>
                {i18n.t(i18nKeys.base_edit)}
              </Button>
            </div>
          </div>
          <div className="mix-service-info-list">
            <div className="mix-service-info">
              <div className="info-name">{i18n.t(i18nKeys.biz_container_startup_script)}</div>
              <div className="info-script">{currentService.custom_service.startup_script}</div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="container-new-edit-svc">
      <div className="container-new-line">
        <FormGroup label={i18n.t(i18nKeys.biz_container_service_type)}>
          <div className={`${getNameSpace()}-html-select`}>
            <select
              name={i18n.t(i18nKeys.biz_container_srvc_type)}
              value={currentSelectServiceType}
              onChange={(e) => {
                setCurrentSelectServiceType(e.target.value as ContainerServiceType)
              }}
              className="middle jupyter-new-select"
            >
              {['builtin', 'custom'].map((i) => (
                <option key={i} value={i}>
                  {getServiceTypeShowText(i as ContainerServiceType)}
                </option>
              ))}
            </select>
            <span
              className={`${getNameSpace()}-icon ${getNameSpace()}-icon-double-caret-vertical`}
            />
          </div>
        </FormGroup>
      </div>
      {currentSelectIsBuildIn && (
        <div className="container-new-line">
          <FormGroup label={i18n.t(i18nKeys.biz_srvc_select_srvc)}>
            <div className={`${getNameSpace()}-html-select`}>
              <select
                name="BuildIn Service"
                value={currentSelectBuildInType}
                onChange={(e) => {
                  setCurrentSelectBuildInType(e.target.value as BuiltinServiceListType)
                }}
                className="middle jupyter-new-select"
              >
                {BuiltServicesToShow.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span
                className={`${getNameSpace()}-icon ${getNameSpace()}-icon-double-caret-vertical`}
              />
            </div>
          </FormGroup>
        </div>
      )}
      {!currentSelectIsBuildIn && window._hf_user_if_in && (
        <div className="container-new-line">
          <FormGroup
            label={i18n.t(i18nKeys.biz_container_custom_srvc_name)}
            helperText={i18n.t(i18nKeys.biz_jupyter_create_svc_name_limit)}
          >
            <InputGroupWithCheck
              value={`${currentSelectCustomName}`}
              onChange={(e) => {
                setCurrentSelectCustomName(e.target.value)
              }}
              checker={(value: string) => {
                if (!value) return true
                return /^[0-9a-z_-]{1,}$/.test(value)
              }}
            />
          </FormGroup>
          <div>
            <Switch
              checked={currentExportCustomPort}
              onChange={(e) => {
                setCurrentExportCustomPort((e.target as HTMLInputElement).checked)
                if ((e.target as HTMLInputElement).checked) {
                  // hint: 这里不调整 protType 的话就可能还是 local，就是有问题的
                  setCurrentSelectCustomPortType('http')
                }
              }}
              labelElement={<strong>{i18n.t(i18nKeys.biz_container_expose_srvc_pod)}</strong>}
            />
          </div>
        </div>
      )}
      {!currentSelectIsBuildIn && window._hf_user_if_in && currentExportCustomPort && (
        <div className="container-new-line">
          <FormGroup
            label={i18n.t(i18nKeys.biz_container_expose_port_type)}
            helperText={i18n.t(i18nKeys.biz_container_expose_type_hint)}
          >
            <div className={`${getNameSpace()}-html-select`}>
              <select
                name="group"
                value={currentSelectCustomPortType}
                onChange={(e) => {
                  setCurrentSelectCustomPortType(e.target.value as ContainerServicePortType)
                }}
                className="middle jupyter-new-select"
              >
                {['http', 'tcp'].map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span
                className={`${getNameSpace()}-icon ${getNameSpace()}-icon-double-caret-vertical`}
              />
            </div>
          </FormGroup>
          <FormGroup
            label={i18n.t(i18nKeys.base_port)}
            helperText={i18n.t(i18nKeys.biz_container_listen_port)}
          >
            <NumericInputWithCheck
              fill
              value={currentSelectCustomPort}
              onValueChange={(value) => {
                setCurrentSelectCustomPort(Number(value))
              }}
              checker={(value: string | number) => {
                return Number(value) <= 65536 && Number(value) >= 0
              }}
            />
          </FormGroup>
        </div>
      )}
      {!currentSelectIsBuildIn && window._hf_user_if_in && (
        <div className="container-new-line callout-warper">
          <Callout intent="none">
            <BizCollapse desc={i18n.t(i18nKeys.biz_container_creator_view_env)}>
              <p className="container-env-p">
                <b>MARSV2_SERVICE_NAME</b>{' '}
                {i18n.t(i18nKeys.biz_container_creator_view_service_name)}（ （{' '}
                {currentSelectCustomName}）
              </p>
              <p className="container-env-p">
                <b>MARSV2_SERVICE_PORT</b> {i18n.t(i18nKeys.biz_container_nodeport_dist_port)}（{' '}
                {currentExportCustomPort ? currentSelectCustomPort : 'None'}）
              </p>
            </BizCollapse>
          </Callout>
        </div>
      )}
      {!currentSelectIsBuildIn && window._hf_user_if_in && (
        <div className="container-new-line last-line">
          <FormGroup
            className="one-line"
            label={i18n.t(i18nKeys.biz_container_start_script)}
            helperText={i18n.t(i18nKeys.biz_container_only_support_one_line_shell)}
          >
            <textarea
              value={`${currentSelectCustomStartScript}`}
              placeholder=""
              onChange={(e) => {
                setCurrentSelectCustomStartScript(e.target.value)
              }}
            />
          </FormGroup>
        </div>
      )}
      {!currentSelectIsBuildIn && !window._hf_user_if_in && (
        <div className="container-new-line">
          <Callout intent="warning" className="no-quota-svc-tip">
            {i18n.t(i18nKeys.biz_container_no_custom_svc_quota_tip)}
          </Callout>
        </div>
      )}
      <div className="container-new-line">
        <Button minimal className="panel-op-btn" intent="danger" outlined onClick={props.onDelete}>
          {i18n.t(i18nKeys.base_delete)}
        </Button>
        <Button
          outlined
          className="panel-op-btn"
          disabled={!currentSelectIsBuildIn && !window._hf_user_if_in}
          intent="primary"
          onClick={onSave}
        >
          {i18n.t(i18nKeys.base_save)}
        </Button>
      </div>
    </div>
  )
}
