import type { TrainingTask } from '../../types'
import type { TaskCreateYamlSchemaV2 } from '../../types/task/yaml'

export const SpecialTags = {
  STAR: 'star',
  HIDDEN: 'Hidden',
  ARCHIVE: 'Archive',
}
export const excludeStar = (tags: string[]): string[] =>
  tags.filter((tag) => tag !== SpecialTags.STAR)

/**
 * 将一个 task 内容转化成可以给 yaml 用的任务提交 schema 格式
 *
 * @deprecated
 * 优先使用 (options.chain.config_json as TaskConfigJsonTraining).schema
 *
 * @reference
 * multi_gpu_runner_server/hfai/client/api/experiment_api.py
 */
export const taskToSchemaV2 = (task: TrainingTask): TaskCreateYamlSchemaV2 => {
  let code_file_with_param = task.code_file.replace(task.workspace, '')

  if (code_file_with_param.indexOf('/') === 0) code_file_with_param = code_file_with_param.slice(1)
  const entrypoint =
    task.config_json.schema?.spec.entrypoint || (code_file_with_param.split(' ')[0] as string)
  const parameters =
    task.config_json.schema?.spec.parameters || code_file_with_param.split(' ').slice(1).join(' ')
  let py_venv: string | undefined
  const environments = {
    ...(task.config_json.schema?.spec.environments || task.config_json.environments),
  }

  // update: 目前都是 schema，其次优先使用 client_options 里面的 py_venv
  if (task.config_json.schema?.options?.py_venv) {
    py_venv = task.config_json.schema?.options.py_venv
  } else if ('HF_ENV_NAME' in environments) {
    py_venv = environments.HF_ENV_NAME as string | undefined
    delete environments.HF_ENV_NAME
    if ('HF_ENV_OWNER' in environments) {
      py_venv = `${py_venv}[${environments.HF_ENV_OWNER}]`
      delete environments.HF_ENV_OWNER
    }
  }

  const excludeStarTags = excludeStar(task.tags ?? [])
  const schema_dict: TaskCreateYamlSchemaV2 = {
    version: 2,
    name: task.nb_name,
    // 最新都是 schema 中，再早是 config_json 中，兜底是 task 中
    priority:
      task.config_json.schema?.priority || (task.config_json as any).priority || task.priority,
    spec: {
      workspace: task.workspace,
      entrypoint,
      parameters: parameters || undefined,
      environments: Object.keys(environments).length ? environments : undefined,
    },
    resource: {
      image:
        task.config_json.schema?.resource.image ?? (task.config_json.train_image || task.backend),
      group: task.config_json.schema?.resource.group || task.group,
      node_count: task.config_json.schema?.resource.node_count || task.nodes,
    },
    options: {
      whole_life_state: task.config_json.schema?.options?.whole_life_state || undefined,
      mount_code: task.config_json.schema?.options?.mount_code || task.mount_code,
      tags: excludeStarTags.length ? excludeStarTags : undefined,
      watchdog_time: task.config_json.schema?.options?.watchdog_time || undefined,
    },
  }

  if (py_venv)
    schema_dict.options = {
      ...schema_dict.options,
      py_venv,
    }

  return schema_dict
}
