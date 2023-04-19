import { brandSetting } from './brand'
import { Languages } from './languages'

// 业务内容

export const copyWriting = Object.assign(brandSetting, {
  biz_base_studio: {
    [Languages.EN]: '{{_PLATFORM_NAME}} Studio',
    [Languages.ZH_CN]: '{{_PLATFORM_NAME}} Studio',
  },
  biz_exp_select_node: {
    [Languages.EN]: 'Please select a node',
    [Languages.ZH_CN]: '请先选择一个节点',
  },
  biz_exp_nodes_validate_nodes: {
    [Languages.EN]: 'Validate Nodes',
    [Languages.ZH_CN]: '验证节点',
  },
  biz_exp_nodes_no_worker: {
    [Languages.EN]: 'No worker for this experiment now',
    [Languages.ZH_CN]: '此实验暂未分配 worker',
  },
  biz_exp_nodes_show_filter: {
    [Languages.EN]: 'Show Filter',
    [Languages.ZH_CN]: '显示删选框',
  },
  biz_exp_nodes_task_nodes: {
    [Languages.EN]: 'Nodes',
    [Languages.ZH_CN]: '实验节点',
  },
  biz_exp_nodes_filter: {
    [Languages.EN]: 'Filter worker by node / status',
    [Languages.ZH_CN]: '根据节点名称或状态筛选',
  },
  biz_exp_status_updated: {
    [Languages.EN]: 'Updated',
    [Languages.ZH_CN]: '更新于',
  },
  biz_priority: {
    [Languages.EN]: 'Priority',
    [Languages.ZH_CN]: '优先级',
  },
  biz_exp_status_chain_id: {
    [Languages.EN]: 'Chain ID (Initial)',
    [Languages.ZH_CN]: 'Chain ID',
  },
  biz_cluster_internal_server_error: {
    [Languages.EN]: 'Request {{url}} Cluster Internal Server Error',
    [Languages.ZH_CN]: '请求 {{url}} 出现集群服务端错误',
  },
  biz_cluster_internal_server_not_success: {
    [Languages.EN]: 'Request {{url}} Not Success',
    [Languages.ZH_CN]: '请求 {{url}} 未成功',
  },
  biz_exp_status_chain_status: {
    [Languages.EN]: 'Chain Status',
    [Languages.ZH_CN]: 'Chain 状态',
  },
  biz_exp_status_stop: {
    [Languages.EN]: 'Stop',
    [Languages.ZH_CN]: '停止',
  },
  biz_exp_status_resume: {
    [Languages.EN]: 'Resume',
    [Languages.ZH_CN]: '恢复',
  },
  biz_exp_status_resume_no_chain_found: {
    [Languages.EN]: 'No historical experiment found to resume',
    [Languages.ZH_CN]: '没有找到可以恢复的历史实验',
  },
  biz_exp_status_resume_title: {
    [Languages.EN]:
      'Inherit the status of the current experiment and continue to run the experiment',
    [Languages.ZH_CN]: '继承当前实验的状态，继续运行试验',
  },
  biz_exp_status_suspend_count: {
    [Languages.EN]: 'Suspend Count',
    [Languages.ZH_CN]: '打断次数',
  },
  biz_exp_status_chain_created: {
    [Languages.EN]: 'Chain Created',
    [Languages.ZH_CN]: 'Chain 创建时间',
  },
  biz_exp_status_chain_begin: {
    [Languages.EN]: 'Begin Time',
    [Languages.ZH_CN]: '开始运行时间',
  },
  biz_exp_status_chain_end: {
    [Languages.EN]: 'End Time',
    [Languages.ZH_CN]: '结束运行时间',
  },
  biz_exp_status_whole_life_state: {
    [Languages.EN]: 'Whole life State',
    [Languages.ZH_CN]: 'Whole life State',
  },
  biz_exp_status_worker_env: {
    [Languages.EN]: 'Environment',
    [Languages.ZH_CN]: '环境',
  },
  biz_exp_status_worker_status: {
    [Languages.EN]: 'Worker Status',
    [Languages.ZH_CN]: '节点状态',
  },
  biz_exp_status_exit_code: {
    [Languages.EN]: 'Exit Code',
    [Languages.ZH_CN]: '退出码',
  },
  biz_exp_status_show_performance: {
    [Languages.EN]: 'Show Performance',
    [Languages.ZH_CN]: '展示性能图表',
  },
  biz_exp_status_task_name: {
    [Languages.EN]: 'Experiment Name',
    [Languages.ZH_CN]: '实验名称',
  },
  biz_loading: {
    [Languages.EN]: 'Loading...',
    [Languages.ZH_CN]: '加载中...',
  },
  biz_exp_submit_priority: {
    [Languages.EN]: 'Priority',
    [Languages.ZH_CN]: '优先级',
  },
  biz_exp_submit_group: {
    [Languages.EN]: 'Group',
    [Languages.ZH_CN]: '分组',
  },
  biz_exp_submit_expand_to_set: {
    [Languages.EN]: 'Expand To Set',
    [Languages.ZH_CN]: '展开以设置',
  },
  biz_exp_submit_expand_to_view: {
    [Languages.EN]: 'Expand To View',
    [Languages.ZH_CN]: '展开以查看',
  },
  biz_exp_submit_worker: {
    [Languages.EN]: 'Worker',
    [Languages.ZH_CN]: '节点',
  },
  biz_exp_submit_worker_helper: {
    [Languages.EN]: 'The number of nodes to run the experiment',
    [Languages.ZH_CN]: '实验运行的节点数',
  },
  biz_exp_submit_file: {
    [Languages.EN]: 'Code File',
    [Languages.ZH_CN]: '入口文件',
  },
  biz_exp_submit_python_hf_env: {
    [Languages.EN]: 'Python hf_env',
    [Languages.ZH_CN]: 'Python hf_env',
  },
  biz_exp_submit_python_hf_env_helper: {
    [Languages.EN]: 'Select a specific hf_env to run experiment',
    [Languages.ZH_CN]: '选择一个特定的 hf_env 来运行实验',
  },
  biz_exp_submit_env: {
    [Languages.EN]: 'Image',
    [Languages.ZH_CN]: '镜像',
  },
  biz_exp_submit_dir: {
    [Languages.EN]: 'Directory',
    [Languages.ZH_CN]: '运行目录',
  },
  biz_exp_submit_required: {
    [Languages.EN]: 'required',
    [Languages.ZH_CN]: '（必填项）',
  },
  biz_exp_submit_with_editor: {
    [Languages.EN]: 'Create experiment with "{{editor}}"',
    [Languages.ZH_CN]: '使用 {{editor}} 提交实验',
  },
  biz_exp_submit_no_active: {
    [Languages.EN]: 'No activated Editor',
    [Languages.ZH_CN]: '未检测到活跃的 python 文件',
  },
  biz_exp_submit_extra_mount: {
    [Languages.EN]: 'Extra Mount',
    [Languages.ZH_CN]: '额外挂载点',
  },
  biz_exp_submit_extra_options: {
    [Languages.EN]: 'Extra Options',
    [Languages.ZH_CN]: '更多可选项',
  },
  biz_exp_submit_extra_options_desc: {
    [Languages.EN]: 'More Optional Configs',
    [Languages.ZH_CN]: '更多可选内容的配置',
  },
  biz_exp_submit_extra_more: {
    [Languages.EN]: 'More',
    [Languages.ZH_CN]: '更多',
  },
  biz_exp_submit_extra_parameters: {
    [Languages.EN]: 'Parameters',
    [Languages.ZH_CN]: '命令行参数',
  },
  biz_exp_submit_extra_parameters_example: {
    [Languages.EN]: 'Example: --seed 0.2',
    [Languages.ZH_CN]: '示例：--seed 0.2',
  },
  biz_exp_submit_extra_envs: {
    [Languages.EN]: 'Environments',
    [Languages.ZH_CN]: '环境变量',
  },
  biz_exp_submit_watchdog_time: {
    [Languages.EN]: 'Watchdog Time (sec)',
    [Languages.ZH_CN]: 'Watchdog 定时 (秒)',
  },
  biz_exp_submit_watchdog_time_desc: {
    [Languages.EN]:
      'The task will be terminated if there is no log output for more than the set time',
    [Languages.ZH_CN]: '任务超过设定时间无日志输出会被终止',
  },
  biz_exp_submit_watchdog_time_default: {
    [Languages.EN]: 'Set to 0 use the default value, 1800 seconds',
    [Languages.ZH_CN]: '设为 0 则使用默认值，1800 秒',
  },
  biz_exp_submit_tags: {
    [Languages.EN]: 'Tags',
    [Languages.ZH_CN]: '标签',
  },
  biz_exp_submit_tags_desc: {
    [Languages.EN]: 'Tags for experiment',
    [Languages.ZH_CN]: '训练的标签',
  },
  biz_exp_submit_tags_no_recently_tag: {
    [Languages.EN]: 'No recently used tags',
    [Languages.ZH_CN]: '没有最近使用过的标签',
  },
  biz_exp_submit_extra_desc: {
    [Languages.EN]: 'The filled environment variables can be read in the experiment',
    [Languages.ZH_CN]: '填入的环境变量可以在实验中获取',
  },
  biz_exp_submit_set_params_empty: {
    [Languages.EN]: 'No Params',
    [Languages.ZH_CN]: '未设置参数',
  },
  biz_exp_submit_set_envs_empty: {
    [Languages.EN]: 'No Environments',
    [Languages.ZH_CN]: '未设置环境变量',
  },
  biz_exp_submit_env_helper: {
    [Languages.EN]: 'The environment image for experiment',
    [Languages.ZH_CN]: '实验使用的环境镜像',
  },
  biz_exp_submit_dir_helper: {
    [Languages.EN]: 'The path your script run at.',
    [Languages.ZH_CN]: '脚本运行路径',
  },
  biz_exp_submit_lifeState_helper: {
    [Languages.EN]: 'Whole Life State Override',
    [Languages.ZH_CN]: '',
  },
  biz_exp_submit_task_not_finished_tip: {
    [Languages.EN]:
      'Current experiment Not finished, Please stop the current experiment before creating new',
    [Languages.ZH_CN]: '当前实验还没有结束，请结束当前实验后提交新实验',
  },
  biz_exp_submit_submit: {
    [Languages.EN]: 'Submit',
    [Languages.ZH_CN]: '提交',
  },
  biz_exp_no_submit_yet: {
    [Languages.EN]: 'NO SUBMISSION YET',
    [Languages.ZH_CN]: '暂未提交实验',
  },
  biz_exp_no_task_found: {
    [Languages.EN]: 'No experiment created with this file',
    [Languages.ZH_CN]: '当前文件未提交过实验',
  },
  biz_quota_priority: {
    [Languages.EN]: 'PRIORITY',
    [Languages.ZH_CN]: '优先级',
  },
  biz_quota_used: {
    [Languages.EN]: 'Used',
    [Languages.ZH_CN]: '用量',
  },
  biz_quota_total: {
    [Languages.EN]: 'Total',
    [Languages.ZH_CN]: '总量',
  },
  biz_quota_tot_lim: {
    [Languages.EN]: 'TOT/LIM',
    [Languages.ZH_CN]: '总/限',
  },
  biz_quota_limit_tooltip: {
    [Languages.EN]: 'When Quota is greater than Limit, it is calculated according to Limit',
    [Languages.ZH_CN]: '当配额大于上限时，按照上限计算',
  },
  biz_quota_limit: {
    [Languages.EN]: 'Limit',
    [Languages.ZH_CN]: '上限',
  },
  biz_quota_limit_desc: {
    [Languages.EN]: 'When Quota is greater than Limit, it is calculated according to Limit',
    [Languages.ZH_CN]: '当配额大于上限时，额度按照上限计算',
  },
  biz_quota_edit: {
    [Languages.EN]: 'Edit',
    [Languages.ZH_CN]: '编辑',
  },
  biz_quota: {
    [Languages.EN]: 'Quota',
    [Languages.ZH_CN]: '配额',
  },
  biz_notifications: {
    [Languages.EN]: 'Notifications',
    [Languages.ZH_CN]: '通知',
  },
  biz_no_notification: {
    [Languages.EN]: 'No Notification',
    [Languages.ZH_CN]: '暂无通知',
  },
  biz_rank_select_no_selection: {
    [Languages.EN]: '(No selection)',
    [Languages.ZH_CN]: '（未选择）',
  },
  biz_apply_ssh_more_quota_failed: {
    [Languages.EN]: 'Failed: More quota is required. Contact platform team.',
    [Languages.ZH_CN]: '失败：配额不足',
  },
  biz_apply_ssh_info_failed: {
    [Languages.EN]: 'Get SSH info failed',
    [Languages.ZH_CN]: '获取 SSH 信息失败',
  },
  biz_apply_ssh_applying: {
    [Languages.EN]: 'Applying...',
    [Languages.ZH_CN]: '申请中...',
  },
  biz_ssh_address_copyed: {
    [Languages.EN]: 'Address already copied to clipboard: ',
    [Languages.ZH_CN]: '地址已经拷贝到剪切板：',
  },
  biz_copy_clipboard_failed: {
    [Languages.EN]: 'Copy to clipboard failed. Please copy it manually.',
    [Languages.ZH_CN]: '拷贝剪切板失败，请手动拷贝',
  },
  biz_exp_detail_bar_status: {
    [Languages.EN]: 'STATUS',
    [Languages.ZH_CN]: '状态',
  },
  biz_exp_detail_bar_lastid: {
    [Languages.EN]: 'LASTID',
    [Languages.ZH_CN]: '最新任务 ID',
  },
  biz_exp_status_exp_manage: {
    [Languages.EN]: 'Experiment Assistant',
    [Languages.ZH_CN]: '实验助手',
  },
  biz_exp_detail_tab_submit: {
    [Languages.EN]: 'submit',
    [Languages.ZH_CN]: '提交',
  },
  biz_exp_detail_collapse_create: {
    [Languages.EN]: 'Create Settings',
    [Languages.ZH_CN]: '创建选项',
  },
  biz_exp_detail_collapse_more_status: {
    [Languages.EN]: 'More Status',
    [Languages.ZH_CN]: '更多状态信息',
  },
  biz_exp_detail_status: {
    [Languages.EN]: 'status',
    [Languages.ZH_CN]: '状态',
  },
  biz_exp_detail_nodes: {
    [Languages.EN]: 'nodes',
    [Languages.ZH_CN]: '节点',
  },
  biz_exp_log_widget_tip_no_current: {
    [Languages.EN]: 'No selected chain.',
    [Languages.ZH_CN]: '没有选择的 chain',
  },
  biz_exp_log_widget_tip_no_log: {
    [Languages.EN]: 'No log for current experiment.',
    [Languages.ZH_CN]: '当前实验暂时没有日志',
  },
  biz_exp_log_widget_tip_error: {
    [Languages.EN]: 'Something wrong happened when sending a request to server.',
    [Languages.ZH_CN]: '请求服务器失败',
  },
  biz_exp_log_widget_tip_loading: {
    [Languages.EN]: 'Loading ...',
    [Languages.ZH_CN]: '加载中...',
  },
  biz_exp_log_show_info_for_chain: {
    [Languages.EN]: 'Show info for chain',
    [Languages.ZH_CN]: '展示 chain 信息',
  },
  biz_exp_log_clip_board: {
    [Languages.EN]: 'Copy to clip board',
    [Languages.ZH_CN]: '复制到剪切板',
  },
  biz_exp_log_last_id: {
    [Languages.EN]: 'Last ID',
    [Languages.ZH_CN]: '最新任务 ID',
  },
  biz_exp_log_chain_id: {
    [Languages.EN]: 'Chain ID',
    [Languages.ZH_CN]: 'Chain ID',
  },
  biz_exp_log_name: {
    [Languages.EN]: 'Name',
    [Languages.ZH_CN]: '名称',
  },
  biz_exp_node_list: {
    [Languages.EN]: 'Node Lists',
    [Languages.ZH_CN]: '节点列表',
  },
  biz_exp_perf_chart_zoom_tip1: {
    [Languages.EN]: 'Slice a range to zoom chart.',
    [Languages.ZH_CN]: '鼠标拖划范围可以放大图表',
  },
  biz_exp_perf_chart_zoom_tip2: {
    [Languages.EN]: 'Double click chart to reset zoom.',
    [Languages.ZH_CN]: '双击复位缩放',
  },
  biz_exp_perf_click_to_copy: {
    [Languages.EN]: 'Click to copy',
    [Languages.ZH_CN]: '点击复制',
  },
  biz_exp_perf_data_interval: {
    [Languages.EN]: 'Data interval',
    [Languages.ZH_CN]: '数据间隔',
  },
  biz_exp_perf_data_interval_help: {
    [Languages.EN]: 'Note: 1min interval data is only retained within several weeks',
    [Languages.ZH_CN]: '注意：1 分钟间隔的数据只保留几周内的',
  },
  biz_avail_path_tip_filter: {
    [Languages.EN]: 'Filter by Keyword in path',
    [Languages.ZH_CN]: '根据关键字筛选路径',
  },
  biz_avail_path_title_h: {
    [Languages.EN]: 'Storage > Available Path',
    [Languages.ZH_CN]: '存储 > 可用路径',
  },
  biz_avail_path_title_desc: {
    [Languages.EN]: 'Paths you can use in experiments.',
    [Languages.ZH_CN]: '实验中可以使用的路径',
  },
  biz_avail_path_title_no_data: {
    [Languages.EN]: 'No Data',
    [Languages.ZH_CN]: '没有数据',
  },
  biz_exp_training_history_title: {
    [Languages.EN]: 'Experiments Manage',
    [Languages.ZH_CN]: '实验管理',
  },
  biz_exp_experiment_detail_title: {
    [Languages.EN]: 'Experiment Detail',
    [Languages.ZH_CN]: '实验详情',
  },
  biz_exp_training_history_title_h: {
    [Languages.EN]: 'Experiments Manage',
    [Languages.ZH_CN]: '实验管理',
  },
  biz_exp_training_history_title_desc: {
    [Languages.EN]: 'The Experiment History',
    [Languages.ZH_CN]: '实验历史详情',
  },
  biz_exp_refresh: {
    [Languages.EN]: 'Refresh',
    [Languages.ZH_CN]: '刷新',
  },
  biz_perf_chart_rank: {
    [Languages.EN]: 'Rank',
    [Languages.ZH_CN]: 'Rank',
  },
  biz_perf_chart_display: {
    [Languages.EN]: 'Display',
    [Languages.ZH_CN]: '展示',
  },
  biz_perf_chart_continuous: {
    [Languages.EN]: 'Cut off gaps',
    [Languages.ZH_CN]: '串联展示',
  },
  biz_nav_storage: {
    [Languages.EN]: 'Storage',
    [Languages.ZH_CN]: '存储',
  },
  biz_exp_only_trainings: {
    [Languages.EN]: 'validations',
    [Languages.ZH_CN]: 'validations',
  },
  biz_exp_auto_show_log: {
    [Languages.EN]: 'Auto show log',
    [Languages.ZH_CN]: '自动打开日志',
  },
  biz_exp_search_by_task_name: {
    [Languages.EN]: 'Search By Name Or ID',
    [Languages.ZH_CN]: '输入实验名称或 ID 搜索',
  },
  biz_vali_confirm: {
    [Languages.EN]: 'Confirm Validate',
    [Languages.ZH_CN]: '节点验证二次确认',
  },
  biz_vali_confirm_warn: {
    [Languages.EN]:
      'WARNING!\n' +
      'This will INTERRUPT the experiments NOW running on these nodes.\n' +
      'Please only use if absolutely necessary.\n' +
      'Are you sure to {{action}} these nodes of {{showName}} ?',
    [Languages.ZH_CN]:
      '警告 !\n' +
      '本操作会打断这些节点上【正在运行】的实验，然后进行检查。如无必要，请不要执本操作。\n' +
      '你确定仍然对 {{showName}} 执行 {{action}} 操作吗？',
  },
  biz_vali_confirm_success: {
    [Languages.EN]:
      'Validation for ID:{{id}} submitted.\n' +
      'Check validations later in experiment list.\n' +
      '(Disable "Only Experiments" at the table head)',
    [Languages.ZH_CN]:
      '针对 ID:{{id}} 的验证实验已经提交.\n' +
      '稍后可以在实验任务列表中检查状态.\n' +
      '（取消勾选 "仅展示实验任务"）',
  },
  biz_vali_submit_failed: {
    [Languages.EN]: 'Submit validate failed',
    [Languages.ZH_CN]: 'validate 实验提交失败',
  },
  biz_vali_failed: {
    [Languages.EN]: 'Run validate for ID:{{id}} failed.',
    [Languages.ZH_CN]: '针对 ID:{{id}} 的验证实验运行失败',
  },
  biz_notification: {
    [Languages.EN]: 'Notification',
    [Languages.ZH_CN]: '通知',
  },
  biz_error_report: {
    [Languages.EN]: 'Error Report',
    [Languages.ZH_CN]: '上报错误',
  },
  biz_token_tip_desc: {
    [Languages.EN]:
      'See there:\n[Menu]-&gt;[Settings]-&gt;[Advanced Settings Editor]-&gt;[HF AILab]',
    [Languages.ZH_CN]: '设置路径:\n[菜单]-&gt;[设置]-&gt;[高级设置编辑器]-&gt;[HF AILab]',
  },
  biz_token_tip_title: {
    [Languages.EN]: 'You should set the {{_PLATFORM_NAME}} token first.',
    [Languages.ZH_CN]: '你需要先设置{{_PLATFORM_NAME}} 的 token',
  },
  biz_tip: {
    [Languages.EN]: 'Tip',
    [Languages.ZH_CN]: '提示',
  },
  biz_conn_lost: {
    [Languages.EN]: 'Connection Lost...\nJupyterLab will auto retry',
    [Languages.ZH_CN]: '与服务器的连接断开...\nJupyterLab 会自动尝试重连',
  },
  biz_ailab_guide: {
    [Languages.EN]: 'AILab Guides',
    [Languages.ZH_CN]: 'AILab 用户指南',
  },
  biz_user_guide: {
    [Languages.EN]: 'User Guide',
    [Languages.ZH_CN]: '使用帮助',
  },
  biz_simple_copy_success: {
    [Languages.EN]: '{{name}} Copied to the clipboard.',
    [Languages.ZH_CN]: '成功复制 {{name}} 到剪贴板',
  },
  biz_simple_copy_failed: {
    [Languages.EN]: 'Copy {{name}} failed.',
    [Languages.ZH_CN]: '复制 {{name}} 失败',
  },
  biz_message_detail: {
    [Languages.EN]: 'Detail',
    [Languages.ZH_CN]: '详情',
  },
  biz_create_unfinished: {
    [Languages.EN]: 'There is a creating unfinished, please wait and retry.',
    [Languages.ZH_CN]: '已有实验正在创建中，请稍后再试',
  },
  biz_create_no_editor: {
    [Languages.EN]: "Can't find activated editor for {{path}}.",
    [Languages.ZH_CN]: '找不到 {{path}} 的活动编辑窗口',
  },
  biz_create_no_code: {
    [Languages.EN]: "Can't get codes for {{path}}, or the code is empty.",
    [Languages.ZH_CN]: '无法获取 {{path}} 的代码，或者文件是空的',
  },
  biz_create_not_save: {
    [Languages.EN]: 'Please save the changes of {{path}} first',
    [Languages.ZH_CN]: '请先保存 {{path}} 的更改',
  },
  biz_create_meta_failed: {
    [Languages.EN]: "Can't get [{{path}}]'s meta info from disk. please check if this file exist",
    [Languages.ZH_CN]: '无法从磁盘读取 {{path}} 的信息，请检查该文件是否存在',
  },
  biz_create_time_conflict: {
    [Languages.EN]:
      'The file {{path}} \n' +
      'on the disk is modified at : {{disk_time}}\n' +
      'on this tab is modified at : {{tab_time}}\n' +
      'to solve this conflict, Please SAVE it manually.',
    [Languages.ZH_CN]:
      '文件 {{path}} 修改时间存在冲突\n' +
      '磁盘上的修改时间 : {{disk_time}}\n' +
      '窗口内容修改时间 : {{tab_time}}\n' +
      '请先手动保存一下文件来解决这个冲突',
  },
  biz_create_get_modified_time_failed: {
    [Languages.EN]: "Get file {{path}}'s last modified time failed! experiment will not be created",
    [Languages.ZH_CN]: '获取文件 {{path}} 的修改时间失败，实验不会被创建',
  },
  biz_create_not_valid_group: {
    [Languages.EN]: 'Not a valid group.',
    [Languages.ZH_CN]: '当前分组不是有效的分组',
  },
  biz_create_no_priority: {
    [Languages.EN]: 'Please set priority',
    [Languages.ZH_CN]: '请设置实验优先级',
  },
  biz_create_priority_not_expect: {
    [Languages.EN]: 'Invalid priority, please check again',
    [Languages.ZH_CN]: '实验优先级设置无效，请检查',
  },
  biz_create_worker_lt_1: {
    [Languages.EN]: 'Worker must >= 1 (If the worker cannot be set, please request Quota first)',
    [Languages.ZH_CN]: '至少要有一个 worker (如果无法设置 worker，请先申请 Quota)',
  },
  biz_create_success: {
    [Languages.EN]: 'Create Experiment with {{path}} succeeded.',
    [Languages.ZH_CN]: '使用 {{path}} 创建实验成功',
  },
  biz_create_failed: {
    [Languages.EN]: 'Create Experiment Failed:\n',
    [Languages.ZH_CN]: '创建实验失败：\n',
  },
  biz_error_401: {
    [Languages.EN]:
      'FetchError: {{_PLATFORM_NAME}} token invalid.\nPlease check:\n[Menu]->[Settings]->[Advanced Settings Editor]->"{{_JUPYTER_PLUGIN_SETTING_NAME}}"',
    [Languages.ZH_CN]:
      '获取错误：{{_PLATFORM_NAME}} token 无效.\n请检查:\n[Menu]->[Settings]->[Advanced Settings Editor]->"{{_JUPYTER_PLUGIN_SETTING_NAME}}"',
  },
  biz_error_fetch: {
    [Languages.EN]: 'Fetch {{fetch_type}} failed.\n{{err}}',
    [Languages.ZH_CN]: '获取 {{fetch_type}} 失败.\n{{err}}',
  },
  biz_error_fetch_with_response: {
    [Languages.EN]: 'Fetch {{fetch_type}} failed.\n(HTTP {{status_code}})',
    [Languages.ZH_CN]: '获取 {{fetch_type}} 失败.\n(HTTP {{status_code}})',
  },
  biz_error_simple: {
    [Languages.EN]: 'Error:\n{{err}}',
    [Languages.ZH_CN]: '错误:\n{{err}}',
  },
  // HINT: 虽然有的地方是会自己刷新的，不过这里还是需要提醒用户及时刷新，不要特别依赖系统的刷新
  biz_control_success: {
    [Languages.EN]:
      'Control experiment succeeded. Refresh later to get the latest status. \nfile: {{file}}, action: {{action}}',
    [Languages.ZH_CN]: '操作发送成功，稍后获取最新状态:\nfile: {{file}}, action: {{action}}',
  },
  biz_control_toast_control: {
    [Languages.EN]: 'About to {{action}} {{file}}',
    [Languages.ZH_CN]: '即将开始对 {{file}} 执行 {{action}}',
  },
  biz_control_failed: {
    [Languages.EN]: 'Control experiment failed.{{err}}',
    [Languages.ZH_CN]: '操作实验失败.{{err}}',
  },
  biz_control: {
    [Languages.EN]: 'Control',
    [Languages.ZH_CN]: '操作',
  },
  biz_control_confirm: {
    [Languages.EN]: 'Are you sure to {{action}} {{task}} ?',
    [Languages.ZH_CN]: '你确定要对 {{task}} 执行 {{action}} 操作吗？',
  },
  biz_clusterInfo_failed: {
    [Languages.EN]: 'Get info failed',
    [Languages.ZH_CN]: '获取分组信息失败',
  },
  biz_clusterInfo_calc_failed: {
    [Languages.EN]: 'Calc cluster usage failed',
    [Languages.ZH_CN]: '计算分组使用时出错',
  },
  biz_user_info: {
    [Languages.EN]: 'user info',
    [Languages.ZH_CN]: '用户信息',
  },
  biz_user_set_quota: {
    [Languages.EN]: 'set quota',
    [Languages.ZH_CN]: '设置配额',
  },
  base_delete: {
    [Languages.EN]: 'Delete',
    [Languages.ZH_CN]: '删除',
  },
  base_Submit: {
    [Languages.EN]: 'Submit',
    [Languages.ZH_CN]: '提交',
  },
  base_Search: {
    [Languages.EN]: 'Search',
    [Languages.ZH_CN]: '搜索',
  },
  base_already_selected: {
    [Languages.EN]: 'Selected',
    [Languages.ZH_CN]: '已选择',
  },
  base_Cancel: {
    [Languages.EN]: 'Cancel',
    [Languages.ZH_CN]: '取消',
  },
  base_Canceled_Success: {
    [Languages.EN]: 'Successfully cancelled',
    [Languages.ZH_CN]: '成功取消该操作',
  },
  base_Canceled: {
    [Languages.EN]: 'Canceled',
    [Languages.ZH_CN]: '已取消',
  },
  base_Clear: {
    [Languages.EN]: 'Clear',
    [Languages.ZH_CN]: '清除',
  },
  base_Confirm: {
    [Languages.EN]: 'Confirm',
    [Languages.ZH_CN]: '确认',
  },
  base_OK: {
    [Languages.EN]: 'OK',
    [Languages.ZH_CN]: '确定',
  },
  base_Download: {
    [Languages.EN]: 'Download',
    [Languages.ZH_CN]: '下载',
  },
  base_Cluster: {
    [Languages.EN]: 'Cluster',
    [Languages.ZH_CN]: '集群',
  },
  base_realtime: {
    [Languages.EN]: 'Current',
    [Languages.ZH_CN]: '当前',
  },
  base_daily: {
    [Languages.EN]: 'Day',
    [Languages.ZH_CN]: '日',
  },
  base_weekly: {
    [Languages.EN]: 'Week',
    [Languages.ZH_CN]: '周',
  },
  base_monthly: {
    [Languages.EN]: 'Month',
    [Languages.ZH_CN]: '月',
  },
  biz_ssh_no_quota: {
    [Languages.EN]: 'Failed: More quota is required. Contact platform team.',
    [Languages.ZH_CN]: 'SSH 配额不足，请联系系统组',
  },
  biz_ssh_failed: {
    [Languages.EN]: 'Get SSH info failed',
    [Languages.ZH_CN]: '获取 SSH 信息失败',
  },
  biz_ssh_applying: {
    [Languages.EN]: 'Applying...',
    [Languages.ZH_CN]: '申请中...',
  },
  biz_ssh_copy_success: {
    [Languages.EN]: 'Address already copied to clipboard.',
    [Languages.ZH_CN]: '地址已经复制到剪贴板',
  },
  biz_ssh_copy_common_success: {
    [Languages.EN]: 'Copy to clipboard successfully',
    [Languages.ZH_CN]: '已经成功复制到剪贴板',
  },
  biz_ssh_copy_failed: {
    [Languages.EN]: 'Copy to clipboard failed. Please copy it manually.',
    [Languages.ZH_CN]: '尝试复制到剪贴板失败，请手动复制',
  },
  biz_info_panel_caption: {
    [Languages.EN]: 'AILab Info Panel',
    [Languages.ZH_CN]: 'AILab 信息面板',
  },
  biz_commands_not_ipynb: {
    [Languages.EN]: '{{path}} is not a .ipynb file',
    [Languages.ZH_CN]: '{{path}} 不是一个 .ipynb 文件',
  },
  biz_commands_open_in_new_tab: {
    [Languages.EN]: 'Open in New Browser Tab With New Workspace',
    [Languages.ZH_CN]: '在新浏览器标签作为新 workspace 打开',
  },
  biz_commands_convert_ipynb_py: {
    [Languages.EN]: 'Convert .ipynb to .py',
    [Languages.ZH_CN]: '转换 .ipynb 为 .py',
  },
  biz_commands_clear_confirm: {
    [Languages.EN]: [
      'If file is too large to open in browser, you can try this.',
      'Otherwise, this function is NOT RECOMMENDED.',
      'Continue?',
    ].join('\n'),
    [Languages.ZH_CN]: [
      '如果文件太大导致浏览器卡死，可以尝试该功能。',
      '其他情况不推荐使用。',
      '继续吗？',
    ].join('\n'),
  },
  biz_commands_clear_output: {
    [Languages.EN]: "Clear.ipynb's output",
    [Languages.ZH_CN]: '清除.ipynb 中的输出',
  },
  biz_commands_new_py: {
    [Languages.EN]: 'New .py File',
    [Languages.ZH_CN]: '新建 .py 文件',
  },
  biz_commands_create_new_py: {
    [Languages.EN]: 'Create a new .py file',
    [Languages.ZH_CN]: '创建新的 .py 文件',
  },
  biz_logViewer_show_sys_log: {
    [Languages.EN]: 'Show log for platform system',
    [Languages.ZH_CN]: '显示平台系统 log',
  },
  biz_logViewer_show_nodes: {
    [Languages.EN]: 'Show nodes',
    [Languages.ZH_CN]: '显示节点',
  },
  biz_logViewer_show_line_time: {
    [Languages.EN]: "Show log line's time",
    [Languages.ZH_CN]: '显示每行日志的时间',
  },
  biz_perf_duplicate: {
    [Languages.EN]: 'Duplicate this chart',
    [Languages.ZH_CN]: '打开图表副本',
  },
  biz_perf_title: {
    [Languages.EN]: 'Perf - {{showName}}',
    [Languages.ZH_CN]: '性能 - {{showName}}',
  },
  biz_avail_path_title: {
    [Languages.EN]: '{{_PLATFORM_NAME}} Available Path',
    [Languages.ZH_CN]: '可用路径',
  },
  biz_info_platform_title: {
    [Languages.EN]: 'Platform Information',
    [Languages.ZH_CN]: '平台基本信息',
  },
  biz_info_cluster_usage_overview: {
    [Languages.EN]: 'Overview',
    [Languages.ZH_CN]: '概况',
  },
  biz_info_cluster_usage_ratio: {
    [Languages.EN]: 'Worker Usage Ratio',
    [Languages.ZH_CN]: '工作节点使用率',
  },
  biz_info_nodes_total_used: {
    [Languages.EN]: 'Working',
    [Languages.ZH_CN]: '工作中',
  },
  biz_info_nodes_free: {
    [Languages.EN]: 'Free',
    [Languages.ZH_CN]: '空闲',
  },
  biz_info_nodes_not_ok: {
    [Languages.EN]: 'Other',
    [Languages.ZH_CN]: '其他',
  },
  biz_info_nodes_free_but_show_schedule: {
    [Languages.EN]: 'Scheduling',
    [Languages.ZH_CN]: '调度中',
  },
  biz_info_nodes_other: {
    [Languages.EN]: 'Other',
    [Languages.ZH_CN]: '其他',
  },
  biz_info_nodes_other_help: {
    [Languages.EN]: 'Including faulty nodes, dev nodes, nodes under test, etc.',
    [Languages.ZH_CN]: '包含故障节点，开发机，测试整备中的节点等',
  },
  biz_info_nodes_total: {
    [Languages.EN]: 'Total',
    [Languages.ZH_CN]: '总节点数',
  },
  biz_info_node_usage_series_chart_title: {
    [Languages.EN]: 'Latest 24h worker usage',
    [Languages.ZH_CN]: '近 24 小时节点用量',
  },
  biz_info_spare_node_usage_series_chart_title: {
    [Languages.EN]: 'Latest 24h spare computing power',
    [Languages.ZH_CN]: '近 24 小时闲时算力',
  },
  biz_info_more_monitor: {
    [Languages.EN]: 'More...',
    [Languages.ZH_CN]: '更多...',
  },
  biz_info_cluster_tasks: {
    [Languages.EN]: 'Experiments',
    [Languages.ZH_CN]: '实验概况',
  },
  biz_info_get_cluster_error: {
    [Languages.EN]: 'Get Cluster Usage Information Timeout',
    [Languages.ZH_CN]: '获取集群使用信息超时',
  },
  biz_info_get_tasks_error: {
    [Languages.EN]: 'Get Tasks Overview Timeout',
    [Languages.ZH_CN]: '获取集群任务概况超时',
  },
  biz_info_task_working: {
    [Languages.EN]: 'Working',
    [Languages.ZH_CN]: '当前运行',
  },
  biz_info_task_queued: {
    [Languages.EN]: 'Queued',
    [Languages.ZH_CN]: '当前排队',
  },
  biz_file_browser_file_large_title: {
    [Languages.EN]: 'Attention: File too large',
    [Languages.ZH_CN]: '文件过大提示',
  },
  biz_file_browser_file_large_title_desc: {
    [Languages.EN]:
      "\nThe selected .ipynb file is too large, Are you sure to continue opening? \n\nYou can use Right Click -> `clear .ipynb's output` to clean up the file output first and then open the file again",
    [Languages.ZH_CN]:
      "\n选择的.ipynb 文件过大，你确认要继续打开吗？\n\n你可以通过 右键->`clear .ipynb's output` 先对文件输出进行清理，之后再次打开文件",
  },
  biz_toast_split_mode_double_click: {
    [Languages.EN]: 'In Isolated Mode, double-click to open the python file',
    [Languages.ZH_CN]: '隔离模式下请双击打开 python 文件',
  },
  biz_toast_create_python_success: {
    [Languages.EN]:
      'The python file is created successfully, please wait for the automatic redirection...',
    [Languages.ZH_CN]: '创建 python 文件成功，请等待自动跳转（初始化可能需要几秒钟）...',
  },
  biz_zen_mode: {
    [Languages.EN]: 'Isolated Mode',
    [Languages.ZH_CN]: '隔离模式',
  },
  biz_zen_mode_confirm_title: {
    [Languages.EN]: 'Are you sure to turn on the Isolated Mode?',
    [Languages.ZH_CN]: '请确认是否进入到隔离模式？',
  },
  biz_file_not_exist: {
    [Languages.EN]: 'File not exist',
    [Languages.ZH_CN]: '文件不存在',
  },
  biz_create_new_python_file_failed: {
    [Languages.EN]: 'Create python file failed, please try again later',
    [Languages.ZH_CN]: '创建 python 文件失败，请稍后重试',
  },
  biz_exp_tag_single_succeeded: {
    [Languages.EN]: 'Edit tags succeeded',
    [Languages.ZH_CN]: '更改标签成功',
  },
  biz_exp_tag_single_failed: {
    [Languages.EN]: 'Failed when handle these following tags: {{tags}}',
    [Languages.ZH_CN]: '更改下列标签时失败：{{tags}}',
  },
  biz_exp_tag_batch_succeeded: {
    [Languages.EN]: 'Batch edit tags succeeded',
    [Languages.ZH_CN]: '批量修改标签成功',
  },
  biz_exp_tag_click_to_edit: {
    [Languages.EN]: 'Click to edit tags',
    [Languages.ZH_CN]: '点击编辑标签',
  },
  biz_exp_tag_batch_failed: {
    [Languages.EN]: 'Edit tags in batches is not completely successful, please check or try again',
    [Languages.ZH_CN]: '批量修改标签没有完全成功，请检查或者重试',
  },
  biz_exp_tag_batch_add: {
    [Languages.EN]: 'Batch Add Tags',
    [Languages.ZH_CN]: '批量添加标签',
  },
  biz_exp_tag_batch_remove: {
    [Languages.EN]: 'Batch Remove Tags',
    [Languages.ZH_CN]: '批量删除标签',
  },
  biz_exp_tag_batch_remove_all: {
    [Languages.EN]: 'Remove from ALL',
    [Languages.ZH_CN]: '从所有实验中删除',
  },
  biz_exp_tag_batch_remove_all_callout: {
    [Languages.EN]:
      'This operation will delete the specified tags in all your experiments, no matter whether the experiment is selected or displayed. Please use with caution.',
    [Languages.ZH_CN]:
      '本操作会在你的所有实验中删除指定标签，无论实验是否选中，是否展示。请谨慎使用。',
  },
  biz_exp_tag_batch_edit: {
    [Languages.EN]: 'Batch Edit Tags',
    [Languages.ZH_CN]: '批量修改标签',
  },
  biz_exp_tag_batch_count: {
    [Languages.EN]: 'Total {{count}} experiments',
    [Languages.ZH_CN]: '共{{count}}个训练',
  },
  biz_exp_tag_batch_add_panel_help: {
    [Languages.EN]:
      'Add tags of selected trainings in batches.You can enter manually below, or quickly select by clicking the list',
    [Languages.ZH_CN]: '为选中的训练批量增加标签。可以在下方手动输入，或者通过点击列表快速选择',
  },
  biz_exp_tag_add_panel_help: {
    [Languages.EN]: 'You can enter manually below, or quickly select by clicking the list',
    [Languages.ZH_CN]: '可以在下方手动输入，或者通过点击列表快速选择',
  },
  biz_exp_tag_update_one: {
    [Languages.EN]: "Edit the experiment's tag",
    [Languages.ZH_CN]: '更改训练的标签',
  },
  biz_exp_tag_recently_used: {
    [Languages.EN]: 'Recently used',
    [Languages.ZH_CN]: '近期使用',
  },
  biz_exp_tag_default_no_hidden: {
    [Languages.EN]: '*Tagged experiment hidden by default',
    [Languages.ZH_CN]: '*打该标签的训练默认隐藏',
  },
  biz_exp_tag_selected: {
    [Languages.EN]: 'Selected tags',
    [Languages.ZH_CN]: '选中的标签',
  },
  biz_exp_tag_no_tag_selected: {
    [Languages.EN]: 'No tag selected',
    [Languages.ZH_CN]: '未选择标签',
  },
  biz_exp_tag_no_tag_to_remove: {
    [Languages.EN]: 'No tag to remove',
    [Languages.ZH_CN]: '没有可以移除的标签',
  },
  biz_exp_tag_select_tag_to_remove: {
    [Languages.EN]: 'Please select tag to remove',
    [Languages.ZH_CN]: '请选择要删除的标签',
  },
  biz_base_add: {
    [Languages.EN]: 'Add',
    [Languages.ZH_CN]: '添加',
  },
  biz_base_remove: {
    [Languages.EN]: 'Remove',
    [Languages.ZH_CN]: '移除',
  },
  biz_exp_stopping: {
    [Languages.EN]: 'Stopping...',
    [Languages.ZH_CN]: '正在停止中...',
  },
  biz_exp_resuming: {
    [Languages.EN]: 'Resuming...',
    [Languages.ZH_CN]: '正在恢复中...',
  },
  biz_exp_suspending: {
    [Languages.EN]: 'Suspending...',
    [Languages.ZH_CN]: '正在打断中...',
  },
  biz_exp_batch_stop: {
    [Languages.EN]: 'Click Confirm to stop the following experiments:',
    [Languages.ZH_CN]: '点击确认，批量停止以下实验：',
  },
  biz_exp_batch_stop_html_title: {
    [Languages.EN]: 'Automatically filter out the unfinished experiments and stop them',
    [Languages.ZH_CN]: '自动过滤出未完成的进行批量停止',
  },
  biz_exp_batch_resume_html_title: {
    [Languages.EN]: 'Automatically filter out the finished experiments and resume them',
    [Languages.ZH_CN]: '自动过滤出已结束的进行批量重跑',
  },
  biz_exp_batch_suspend_html_title: {
    [Languages.EN]: 'Automatically filter out the running experiments and suspend them',
    [Languages.ZH_CN]: '自动过滤出正在运行的实验进行批量打断',
  },
  biz_exp_batch_tag_html_title: {
    [Languages.EN]: 'Edit tags for selected experiments',
    [Languages.ZH_CN]: '批量编辑标签',
  },
  biz_exp_batch_stop_already_filter: {
    [Languages.EN]: 'Already filtered experiments finished, surplus:',
    [Languages.ZH_CN]: '已自动过滤已结束的实验，剩余',
  },
  biz_batch_stop_success_all: {
    [Languages.EN]: 'Stop experiments successfully, status will be updated later',
    [Languages.ZH_CN]: '批量停止实验发送成功，稍后会更新状态',
  },
  biz_exp_batch_resume_only_failed: {
    [Languages.EN]: 'Only Resume Failed Experiments',
    [Languages.ZH_CN]: '只恢复失败的实验',
  },
  biz_exp_batch_resume_already_filter: {
    [Languages.EN]: 'Already filtered experiments not finished, surplus:',
    [Languages.ZH_CN]: '已自动过滤未完成的实验，剩余：',
  },
  biz_exp_batch_suspend_already_filter: {
    [Languages.EN]: 'Already filtered running experiments, surplus:',
    [Languages.ZH_CN]: '已自动选择正在运行的实验，剩余：',
  },
  biz_exp_batch_resume_empty: {
    [Languages.EN]: 'no matched experiments',
    [Languages.ZH_CN]: '没有可以恢复的实验',
  },
  biz_exp_batch_suspend_empty: {
    [Languages.EN]: 'no matched experiments',
    [Languages.ZH_CN]: '没有可以打断的实验',
  },
  biz_exp_batch_resume: {
    [Languages.EN]:
      'Click Confirm to resume the following experiments (The recovered experiment will inherit the current state):',
    [Languages.ZH_CN]: '点击确认，批量恢复以下实验（恢复的实验会继承实验结束时的状态）：',
  },
  biz_exp_batch_suspend: {
    [Languages.EN]:
      'Click Confirm to suspend the following experiments (The recovered experiment will inherit the current state):',
    [Languages.ZH_CN]: '点击确认，批量打断以下实验（恢复的实验会继承实验结束时的状态）：',
  },
  biz_batch_resume_success_all: {
    [Languages.EN]: 'Resume experiments successfully, status will be updated later',
    [Languages.ZH_CN]: '批量恢复实验发送成功，稍后会更新状态',
  },
  biz_batch_suspend_success_all: {
    [Languages.EN]: 'Suspend experiments successfully, status will be updated later',
    [Languages.ZH_CN]: '批量打断实验发送成功，稍后会更新状态',
  },
  biz_batch_stop_success_part: {
    [Languages.EN]: 'Stop experiments complete, success:{{success}} fail:{{fail}}',
    [Languages.ZH_CN]: '停止实验执行完成，成功：{{success}} 失败：{{fail}}',
  },
  biz_batch_resume_success_part: {
    [Languages.EN]: 'Resume experiments complete, success:{{success}} fail:{{fail}}',
    [Languages.ZH_CN]: '恢复实验执行完成，成功：{{success}} 失败：{{fail}}',
  },
  biz_batch_suspend_success_part: {
    [Languages.EN]: 'Suspend experiments complete, success:{{success}} fail:{{fail}}',
    [Languages.ZH_CN]: '打断实验执行完成，成功：{{success}} 失败：{{fail}}',
  },
  biz_exp_batch_op: {
    [Languages.EN]: 'Batch Op',
    [Languages.ZH_CN]: '批量操作',
  },
  biz_exp_batch: {
    [Languages.EN]: 'Batch',
    [Languages.ZH_CN]: '批处理',
  },
  biz_exp_batch_stop_btn: {
    [Languages.EN]: 'Stop',
    [Languages.ZH_CN]: '停止',
  },
  biz_exp_batch_resume_btn: {
    [Languages.EN]: 'Resume',
    [Languages.ZH_CN]: '恢复',
  },
  biz_exp_batch_edit_tag_btn: {
    [Languages.EN]: 'Update Tag',
    [Languages.ZH_CN]: '更新标签',
  },
  biz_logViewer_auto_word_wrap: {
    [Languages.EN]: 'Word Wrap',
    [Languages.ZH_CN]: '自动换行',
  },
  biz_logViewer_split_line_jump_up: {
    [Languages.EN]: 'Jump To Previous Start Log Position',
    [Languages.ZH_CN]: '跳转到上一次启动首行日志位置',
  },
  biz_logViewer_split_line_jump_down: {
    [Languages.EN]: 'Jump To Next Start Log Log Position',
    [Languages.ZH_CN]: '跳转到下一次启动首行日志位置',
  },
  biz_logViewer_split_line_jump_bottom: {
    [Languages.EN]: 'Jump To Last Start Log Position',
    [Languages.ZH_CN]: '跳转到最后一次启动首行日志位置',
  },
  biz_logViewer_split_line_jump_top_already_visible: {
    [Languages.EN]: 'The first start log is already in the visible area',
    [Languages.ZH_CN]: '首次启动首行日志已经在可视区域内',
  },
  biz_logViewer_split_line_jump_bottom_already_visible: {
    [Languages.EN]: 'The last start log is already in the visible area',
    [Languages.ZH_CN]: '最后一次启动首行日志已经在可视区域内',
  },
  biz_logViewer_show_minimap: {
    [Languages.EN]: 'Show Minimap',
    [Languages.ZH_CN]: '展示日志缩略图',
  },
  biz_auto_refreshing: {
    [Languages.EN]: 'Auto Refreshing',
    [Languages.ZH_CN]: '自动刷新中',
  },
  base_inv: {
    [Languages.EN]: '#INV',
    [Languages.ZH_CN]: '#失效',
  },
  biz_exp_submit_priority_helper: {
    [Languages.EN]: 'Priority for schedule at experiment init.',
    [Languages.ZH_CN]: '实验初始化时的调度优先级',
  },
  biz_exp_submit_whole_life_state_helper: {
    [Languages.EN]: '"Whole life state" value set at experiment init',
    [Languages.ZH_CN]: '实验初始化时的 whole life state 值',
  },
  base_clear_zero: {
    [Languages.EN]: 'Clear',
    [Languages.ZH_CN]: '清零',
  },
  biz_exp_perf: {
    [Languages.EN]: 'Perf',
    [Languages.ZH_CN]: '性能',
  },
  biz_exp_opened_file: {
    [Languages.EN]: 'This is an opened file',
    [Languages.ZH_CN]: '这是一个打开的文件',
  },
  biz_exp_selected_chain: {
    [Languages.EN]: 'Selected chain',
    [Languages.ZH_CN]: '选中的 chain 实例',
  },
  biz_current_priority: {
    [Languages.EN]: 'Current Priority',
    [Languages.ZH_CN]: '当前优先级',
  },
  biz_exp_status_task_created: {
    [Languages.EN]: 'Created Time',
    [Languages.ZH_CN]: '提交时间',
  },
  biz_exp_status_current_whole_life_state: {
    [Languages.EN]: 'Current whole life state',
    [Languages.ZH_CN]: '当前 whole life state',
  },
  base_Status: {
    [Languages.EN]: 'Status',
    [Languages.ZH_CN]: '状态',
  },
  biz_exp_no_current: {
    [Languages.EN]: 'Please active .py or .sh file, or select a chain from Experiment Manager.',
    [Languages.ZH_CN]: '请选中一个 python 文件或 .sh 文件，或者从实验列表中选择一个实验',
  },
  biz_create_not_valid_image: {
    [Languages.EN]: 'Not a valid image({{more_msg}}).',
    [Languages.ZH_CN]: '当前环境不是有效的环境 ({{more_msg}})',
  },
  biz_create_not_valid_image_empty: {
    [Languages.EN]: 'Not a valid image(empty).',
    [Languages.ZH_CN]: '当前环境不是有效的环境 (传入为空)',
  },
  biz_exp_getting_info: {
    [Languages.EN]: 'Getting Info for {{name}}...',
    [Languages.ZH_CN]: '正在获取 {{name}} 的信息...',
  },
  biz_exp_get_info_failed: {
    [Languages.EN]: 'Get experiment info failed.',
    [Languages.ZH_CN]: '查找实验信息失败',
  },
  biz_io_on: {
    [Languages.EN]: 'Continuously updating...click to stop',
    [Languages.ZH_CN]: '持续更新中，点击禁用',
  },
  biz_io_off: {
    [Languages.EN]: 'click to enable continuously update',
    [Languages.ZH_CN]: '点击启用实时更新',
  },
  biz_io_disabled: {
    [Languages.EN]: "Can't enable continuously update now",
    [Languages.ZH_CN]: '当前无法使用实时更新',
  },
  base_retry: {
    [Languages.EN]: 'Retry',
    [Languages.ZH_CN]: '重试',
  },
  base_restart: {
    [Languages.EN]: 'Restart',
    [Languages.ZH_CN]: '重启',
  },
  biz_dynamic_module_load_error: {
    [Languages.EN]:
      'Maybe because the project version has been dynamically updated. Just refresh the page!(ctrl+F5 to reload the whole page)',
    [Languages.ZH_CN]:
      '可能由于版本已经动态更新，刷新本页面即可（ctrl+F5 刷新整个页面，而不是点击页面上的某个按钮）',
  },
  biz_validate_clear_all: {
    [Languages.EN]: 'Clear All',
    [Languages.ZH_CN]: '清除所有',
  },
  biz_validate_clear_all_search: {
    [Languages.EN]: 'Clear Selected',
    [Languages.ZH_CN]: '清除选择',
  },
  biz_validate_select_all: {
    [Languages.EN]: 'Select All',
    [Languages.ZH_CN]: '选择所有',
  },
  biz_validate_select_failed: {
    [Languages.EN]: 'Select Failed',
    [Languages.ZH_CN]: '选择失败',
  },
  biz_validate_start_validate: {
    [Languages.EN]: 'Start Validate',
    [Languages.ZH_CN]: '开始验证',
  },
  biz_validate_settings: {
    [Languages.EN]: 'Validate Settings',
    [Languages.ZH_CN]: '验证设置',
  },
  biz_validate_task: {
    [Languages.EN]: 'By Experiment',
    [Languages.ZH_CN]: '根据实验验证',
  },
  biz_validate_nodes: {
    [Languages.EN]: 'By Nodes',
    [Languages.ZH_CN]: '根据节点验证',
  },
  biz_validate_none_select_error: {
    [Languages.EN]: 'Error: please select nodes when validate by nodes',
    [Languages.ZH_CN]: '请先选择需要验证的节点',
  },
  biz_change_lan_success: {
    [Languages.EN]: 'Switch language success, Refresh the page to take effect',
    [Languages.ZH_CN]: '切换语言成功，刷新页面生效',
  },
  biz_search_global_placeholder: {
    [Languages.EN]: 'Search logs of all nodes (Press Esc to exit)',
    [Languages.ZH_CN]: '搜索所有节点的日志（按 Esc 键退出）',
  },
  biz_search_global_no_node_found: {
    [Languages.EN]: 'No node found',
    [Languages.ZH_CN]: '没有找到节点',
  },
  biz_search_global_count: {
    [Languages.EN]: 'Count',
    [Languages.ZH_CN]: '统计 (次)',
  },
  biz_no_data: {
    [Languages.EN]: 'No Data',
    [Languages.ZH_CN]: '无数据',
  },
  biz_only_show_star: {
    [Languages.EN]: 'Only Show Starred Experiments',
    [Languages.ZH_CN]: '只展示收藏实验',
  },
  biz_ignore_hidden: {
    [Languages.EN]: 'Not Show Hidden Experiments',
    [Languages.ZH_CN]: '不展示已经被手动隐藏的实验',
  },
  biz_star_exp: {
    [Languages.EN]: 'Star this experiment',
    [Languages.ZH_CN]: '收藏该实验',
  },
  biz_unstar_exp: {
    [Languages.EN]: 'Unstar this experiment',
    [Languages.ZH_CN]: '取消收藏该实验',
  },
  biz_hidden_exp: {
    [Languages.EN]: 'Hide This Experiment',
    [Languages.ZH_CN]: '隐藏该实验（隐藏后，该实验默认不再展示）',
  },
  biz_unhidden_exp: {
    [Languages.EN]: 'Unhide This Experiment',
    [Languages.ZH_CN]: '取消隐藏该实验',
  },
  biz_star_exp_succ: {
    [Languages.EN]: 'Star Success',
    [Languages.ZH_CN]: '收藏成功',
  },
  biz_unstar_exp_succ: {
    [Languages.EN]: 'Unstar Success',
    [Languages.ZH_CN]: '取消收藏成功',
  },
  biz_no_validate_exps_tip: {
    [Languages.EN]: 'If checked, other type like validation tasks, will not be shown.',
    [Languages.ZH_CN]: '勾选后将会展示类别为 validation 的实验，通常无需勾选',
  },
  biz_filter_begin_time_placeholder: {
    [Languages.EN]: 'Create Time Rage:begin',
    [Languages.ZH_CN]: '创建时间区间：开始',
  },
  biz_filter_end_time_placeholder: {
    [Languages.EN]: 'Create Time Rage:end',
    [Languages.ZH_CN]: '创建时间区间：结束',
  },
  biz_cost_time_help: {
    [Languages.EN]: 'The sum of all running time',
    [Languages.ZH_CN]: '所有运行时间段之和',
  },
  biz_copy_task_id: {
    [Languages.EN]: 'Click to copy this Task ID',
    [Languages.ZH_CN]: '点击复制该任务 ID',
  },
  biz_begin_at_help: {
    [Languages.EN]:
      'For experiments that have not yet started, display the create time.\n For experiments that have already started, display the start running time',
    [Languages.ZH_CN]: '对于还未开始的实验，展示创建时间，对于已经开始的实验，展示运行开始的时间',
  },
  biz_tn_try_open_file_jupyter: {
    [Languages.EN]: 'Try to open the source code in jupyter',
    [Languages.ZH_CN]: '尝试在 jupyter 中打开对应的代码文件',
  },
  base_dialog_close_tip: {
    [Languages.EN]: 'Close after {{seconds}} seconds',
    [Languages.ZH_CN]: '{{seconds}} 秒后关闭',
  },
  biz_trainings_page_tip: {
    [Languages.EN]: 'Please enter a number from 0 to 50 (inclusive)',
    [Languages.ZH_CN]: '请输入 0 - 50(含) 的数字',
  },
  socket_get_tasks_failed: {
    [Languages.EN]: 'Get Experiments Failed, Will Retry Later',
    [Languages.ZH_CN]: '获取实验列表失败，稍后自动重试',
  },
  socket_get_logs_failed: {
    [Languages.EN]: 'Get Log Failed, Will Retry Later',
    [Languages.ZH_CN]: '获取日志失败，稍后自动重试',
  },
  biz_check_max_worker_toast: {
    [Languages.EN]: '最大申请的节点数量不能超过配额',
    [Languages.ZH_CN]: 'The maximum number of nodes to be apply cannot exceed the quota',
  },
  biz_customize_columns_to_display: {
    [Languages.EN]: 'Customize the columns to display',
    [Languages.ZH_CN]: '自定义要展示的列',
  },
  biz_env_mars: {
    [Languages.EN]: 'Builtin Images',
    [Languages.ZH_CN]: '集群内建镜像',
  },
  biz_env_user: {
    [Languages.EN]: 'Custom Images',
    [Languages.ZH_CN]: '用户自定义镜像',
  },
  biz_date_today: {
    [Languages.EN]: 'Today',
    [Languages.ZH_CN]: '今天',
  },
  biz_date_yesterday: {
    [Languages.EN]: 'Yesterday',
    [Languages.ZH_CN]: '昨天',
  },
  biz_date_last_week: {
    [Languages.EN]: 'Last Week',
    [Languages.ZH_CN]: '上一周',
  },
  biz_date_select_range: {
    [Languages.EN]: 'By Date',
    [Languages.ZH_CN]: '按时间',
  },
  biz_date_range_begin: {
    [Languages.EN]: 'Begin Time',
    [Languages.ZH_CN]: '区间开始时间',
  },
  biz_date_range_end: {
    [Languages.EN]: 'End Time',
    [Languages.ZH_CN]: '区间结束时间',
  },
  biz_create_experiment_success: {
    [Languages.EN]: 'Submit Experiment Success',
    [Languages.ZH_CN]: '提交实验成功',
  },
  biz_submit_not_allow_space: {
    [Languages.EN]:
      'Please remove the spaces, tabs, and page breaks in the file name before submitting',
    [Languages.ZH_CN]: '请移除文件名中的空格、制表符、换行符再提交',
  },
  biz_filter_by_groups: {
    [Languages.EN]: 'By Groups',
    [Languages.ZH_CN]: '按分组',
  },
  biz_filter_by_tag: {
    [Languages.EN]: 'By Tag',
    [Languages.ZH_CN]: '按标签',
  },
  biz_filter_n_tag: {
    [Languages.EN]: '{{n}} Tags',
    [Languages.ZH_CN]: '{{n}} 标签',
  },
  biz_filter_n_groups: {
    [Languages.EN]: '{{n}} Groups',
    [Languages.ZH_CN]: '{{n}} 分组',
  },
  biz_jupyter_copy_kernel_url: {
    [Languages.EN]: 'Copy Kernel URL(for VSCode/PyCharm)',
    [Languages.ZH_CN]: '拷贝 Kernel 地址（用于 VSCode/PyCharm）',
  },
  biz_filter_reset: {
    [Languages.EN]: 'Reset Filters',
    [Languages.ZH_CN]: '重置筛选',
  },
  biz_log_share: {
    [Languages.EN]: 'Share URL with log to others',
    [Languages.ZH_CN]: '分享日志链接给其他人',
  },
  biz_storage_exceed_tip_in_manage: {
    [Languages.EN]:
      "At present, the quota is limited because the storage usage exceeds the limit, and the experiment cannot be run. Please apply for recovery in Studio's Overview ->Storage Usage panel after manual cleaning",
    [Languages.ZH_CN]:
      '目前因存储使用超限被限制配额，无法运行实验，请手动清理存储空间后在 Studio 概览->存储用量面板申请恢复',
  },
  biz_exp_schedule_status: {
    [Languages.EN]: 'Personal Priority Queue Order',
    [Languages.ZH_CN]: '个人优先级队列位置',
  },
  biz_exp_schedule_order: {
    [Languages.EN]: 'Order:',
    [Languages.ZH_CN]: '排序：',
  },
  biz_exp_schedule_move_to_first: {
    [Languages.EN]: 'To First',
    [Languages.ZH_CN]: '移至队头',
  },
  biz_exp_schedule_unavailable: {
    [Languages.EN]: 'The scheduling conditions have not been met yet, please try again later',
    [Languages.ZH_CN]: '暂未满足调度条件，请稍后重试',
  },
  biz_exp_draft_local_changed_to: {
    [Languages.EN]: 'Local draft changed to: {{value}}',
    [Languages.ZH_CN]: '本地草稿已更改：{{value}}',
  },
  biz_exp_schedule_succ: {
    [Languages.EN]: 'The adjustment is successful, and the scheduling status will be updated later',
    [Languages.ZH_CN]: '调整成功，稍后调度状态会进行更新',
  },
  biz_exp_log_change_service_name: {
    [Languages.EN]: 'Click to switch the service log, the default displayed is the experiment log',
    [Languages.ZH_CN]: '点击切换服务日志，默认展示的 [default] 为训练日志',
  },
  biz_update_time: {
    [Languages.EN]: 'Update Time',
    [Languages.ZH_CN]: '更新时间',
  },
  biz_app_confirm_change_lan: {
    [Languages.EN]: 'Confirm to switch the language to Chinese and refresh the page?',
    [Languages.ZH_CN]: '确认切换语言至英语并刷新页面？',
  },
  biz_jupyter_manage: {
    [Languages.EN]: 'Jupyter Manage',
    [Languages.ZH_CN]: 'Jupyter 管理',
  },
  biz_jupyter_list: {
    [Languages.EN]: 'Created Jupyter List',
    [Languages.ZH_CN]: '已创建的 Jupyter 列表',
  },
  biz_jupyter_create_success: {
    [Languages.EN]: '{{name}} create success',
    [Languages.ZH_CN]: '{{name}} 创建成功',
  },
  biz_jupyter_checkpoint_loading: {
    [Languages.EN]: 'waiting checkpoint result...',
    [Languages.ZH_CN]: 'checkpoint 响应等待中...',
  },
  biz_jupyter_create_failed: {
    [Languages.EN]: '{{name}} create failed: {{msg}}',
    [Languages.ZH_CN]: '{{name}} 创建失败：{{msg}}',
  },
  biz_jupyter_exec_op: {
    [Languages.EN]: 'are you sure to {{op}} {{name}}?',
    [Languages.ZH_CN]: '你确定要对 {{name}} 执行 {{op}} 么？',
  },
  biz_jupyter_exec_succ: {
    [Languages.EN]: '{{op}} {{name}} success! Please wait for the status to update automatically',
    [Languages.ZH_CN]: '{{op}} {{name}} 成功，请等待状态自动更新',
  },
  biz_jupyter_exec_fail: {
    [Languages.EN]: '{{op}} {{name}} failed: {{msg}}',
    [Languages.ZH_CN]: '{{op}} {{name}} 失败：{{msg}}',
  },
  biz_jupyter_last_checkpoint: {
    [Languages.EN]: 'Last save checkpoint time: {{last_time}}',
    [Languages.ZH_CN]: '上次持久化时间：{{last_time}}',
  },
  biz_jupyter_no_checkpoint_time: {
    [Languages.EN]: 'not save checkpoint ever',
    [Languages.ZH_CN]: '未持久化过',
  },
  biz_jupyter_checkpoint_tip: {
    [Languages.EN]:
      'Need to wait 1-5 minutes, during which the container is inaccessible, and returns to normal after the end',
    [Languages.ZH_CN]: '需要等待 1~5 分钟，期间容器不可访问，结束后恢复正常',
  },
  biz_jupyter_checkpoint_if_sure: {
    [Languages.EN]: 'Are you sure to persist the container to the image?',
    [Languages.ZH_CN]: '您确定要持久化容器到镜像吗？',
  },
  biz_jupyter_checkpoint_succ: {
    [Languages.EN]: 'save checkpoint for {{name}} success',
    [Languages.ZH_CN]: '保存 checkpoint 成功',
  },
  biz_jupyter_checkpoint_err: {
    [Languages.EN]: 'save checkpoint for {{name}} err: {{msg}}',
    [Languages.ZH_CN]: '保存 checkpoint 失败：{{msg}}',
  },
  biz_jupyter_create_name_limit: {
    [Languages.EN]: 'Only lowercase letters, numbers, dashes and underscores are allowed',
    [Languages.ZH_CN]: '只能输入数字、小写字母、短横线和下划线',
  },
  biz_jupyter_create_svc_name_limit: {
    [Languages.EN]: 'Only lowercase letters, numbers, dashes are allowed',
    [Languages.ZH_CN]: '只能输入数字、小写字母、短横线',
  },
  biz_jupyter_group_max_cpu: {
    [Languages.EN]: 'The maximum number of CPU cores of this grouping node is:',
    [Languages.ZH_CN]: '该分组节点最大 CPU 核数为：',
  },
  biz_jupyter_group_max_mem: {
    [Languages.EN]: 'The maximum remaining memory of the grouping node is',
    [Languages.ZH_CN]: '该分组节点最大剩余内存为：',
  },
  biz_jupyter_group_max_nodes: {
    [Languages.EN]: 'The number of remaining idle nodes in the group:',
    [Languages.ZH_CN]: '该分组剩余空闲节点数：',
  },
  biz_jupyter_create: {
    [Languages.EN]: 'create',
    [Languages.ZH_CN]: '创建',
  },
  biz_jupyter_create_btn: {
    [Languages.EN]: 'Create Jupyter Instance',
    [Languages.ZH_CN]: '新建 Jupyter 实例',
  },
  biz_jupyter_create_param_check_fail: {
    [Languages.EN]: 'param check failed {{name}}',
    [Languages.ZH_CN]: '参数检查失败',
  },
  io_tip_not_connected: {
    [Languages.EN]: 'Live update: off',
    [Languages.ZH_CN]: '实时更新关闭',
  },
  io_tip_fatal_title: {
    [Languages.EN]:
      'Live update has been turned off, which may be due to the detection of errors or resource constraints. \nYou can refresh the page to try to reopen it',
    [Languages.ZH_CN]: '实时更新已关闭，可能是由于检测到错误或资源紧张\n你可以刷新页面重新开启',
  },
  io_tip_not_connected_title: {
    [Languages.EN]: 'Live update has been turned off, try to reconnect...',
    [Languages.ZH_CN]: '实时更新已关闭，尝试重新连接',
  },
  io_tip_connected: {
    [Languages.EN]: 'Live update: on',
    [Languages.ZH_CN]: '实时更新开启',
  },
  io_tip_connected_title: {
    [Languages.EN]: 'Live update for logs, experiments lists and experiment details are turned on',
    [Languages.ZH_CN]: '针对日志、实验列表和实验详情等模块的实时更新已开启',
  },
  biz_log_upload: {
    [Languages.EN]: 'Upload Log',
    [Languages.ZH_CN]: '上传日志',
  },
  biz_log_upload_body: {
    [Languages.EN]:
      'If you click upload log, the log will be automatically uploaded to the backend of the platform during the idle period',
    [Languages.ZH_CN]: '如果点击上传日志，就会在空闲阶段自动上传日志到平台后端',
  },
  biz_log_upload_title: {
    [Languages.EN]: 'Upload Log',
    [Languages.ZH_CN]: '上传日志',
  },
  biz_log_upload_cancel: {
    [Languages.EN]: 'cancel',
    [Languages.ZH_CN]: '取消',
  },
  biz_log_upload_confirm: {
    [Languages.EN]: 'Confirm Upload',
    [Languages.ZH_CN]: '确定上传',
  },
  biz_log_upload_start: {
    [Languages.EN]: 'Begin Upload Log',
    [Languages.ZH_CN]: '开始上传日志',
  },
  biz_log_upload_end: {
    [Languages.EN]: 'Upload Log Success',
    [Languages.ZH_CN]: '成功上传日志',
  },
  biz_path_guide: {
    [Languages.EN]: 'Path Guide',
    [Languages.ZH_CN]: '路径指引',
  },
  biz_workspace: {
    [Languages.EN]: 'Workspace',
    [Languages.ZH_CN]: '工作区',
  },
  biz_workspace_name: {
    [Languages.EN]: 'Name',
    [Languages.ZH_CN]: '名称',
  },
  biz_workspace_local_path: {
    [Languages.EN]: 'Local Path',
    [Languages.ZH_CN]: '本地路径',
  },
  biz_workspace_cluster_path: {
    [Languages.EN]: 'Cluster Path',
    [Languages.ZH_CN]: '集群路径',
  },
  biz_workspace_push_status: {
    [Languages.EN]: 'Push Status',
    [Languages.ZH_CN]: '上传状态',
  },
  biz_workspace_push_updated_at: {
    [Languages.EN]: 'Push Time',
    [Languages.ZH_CN]: '最新上传',
  },
  biz_workspace_pull_status: {
    [Languages.EN]: 'Pull Status',
    [Languages.ZH_CN]: '下载状态',
  },
  biz_workspace_pull_updated_at: {
    [Languages.EN]: 'Pull Time',
    [Languages.ZH_CN]: '最新下载',
  },
  biz_workspace_push_updated_at_time: {
    [Languages.EN]: 'Recent Push Time',
    [Languages.ZH_CN]: '最新上传时间',
  },
  biz_workspace_file_update_time: {
    [Languages.EN]: 'Modified Time',
    [Languages.ZH_CN]: '更新时间',
  },
  biz_workspace_files_loadmore: {
    [Languages.EN]: 'Load More',
    [Languages.ZH_CN]: '加载更多',
  },
  biz_workspace_files_load_done: {
    [Languages.EN]: 'All Files Above',
    [Languages.ZH_CN]: '全部文件加载完成',
  },
  biz_workspace_size: {
    [Languages.EN]: 'Size',
    [Languages.ZH_CN]: '大小',
  },
  biz_workspace_browser: {
    [Languages.EN]: 'Browser',
    [Languages.ZH_CN]: '浏览',
  },
  biz_storage_usage_free: {
    [Languages.EN]: 'Free',
    [Languages.ZH_CN]: '空闲',
  },
  biz_storage_no_limitation: {
    [Languages.EN]: 'No limitation',
    [Languages.ZH_CN]: '未设限',
  },
  biz_storage_usage_others: {
    [Languages.EN]: 'Others',
    [Languages.ZH_CN]: '其他目录',
  },
  biz_storage_usage_used: {
    [Languages.EN]: 'Used',
    [Languages.ZH_CN]: '占用',
  },
  biz_storage_usage_personal_usage: {
    [Languages.EN]: 'Personal Usage',
    [Languages.ZH_CN]: '我的用量',
  },
  biz_storage_usage_group_total: {
    [Languages.EN]: 'Group Total Usage',
    [Languages.ZH_CN]: '组总用量',
  },
  biz_storage_usage_group_free: {
    [Languages.EN]: 'Group Free',
    [Languages.ZH_CN]: '组剩余可用',
  },
  biz_storage_usage_usage_info: {
    [Languages.EN]: 'Usage',
    [Languages.ZH_CN]: '使用情况',
  },
  biz_storage_usage_group_shared: {
    [Languages.EN]: 'Group Shared Dir Usage',
    [Languages.ZH_CN]: '组共享目录用量',
  },
  biz_error_trainings_quota_exceeded_desc: {
    [Languages.EN]:
      'The number of application nodes for the Experiment {{name}} exceeds your quota, it will not be scheduled. Please handle it manually.',
    [Languages.ZH_CN]: '实验 {{name}}  的申请节点数超过你的 quota，将无法被调度，请手动处理',
  },
  biz_error_trainings_error_desc: {
    [Languages.EN]: 'You have {{n}} exceptions to handle',
    [Languages.ZH_CN]: '你有 {{n}} 个异常需要处理',
  },
  base_path: {
    [Languages.EN]: 'Path',
    [Languages.ZH_CN]: '路径',
  },
  biz_paths_internal_no_display: {
    [Languages.EN]: 'Internal user not shown this',
    [Languages.ZH_CN]: '内部用户不展示路径相应内容',
  },
  biz_paths_copy_absolute_path: {
    [Languages.EN]: 'Copy Absolute Path',
    [Languages.ZH_CN]: '复制绝对路径',
  },
  biz_paths_important_paths: {
    [Languages.EN]: 'Important accessible paths',
    [Languages.ZH_CN]: '重点可访问路径',
  },
  biz_paths_jupyter_home: {
    [Languages.EN]: 'Jupyter Home',
    [Languages.ZH_CN]: 'Jupyter 根路径',
  },
  biz_paths_personal_data: {
    [Languages.EN]: 'Personal Data',
    [Languages.ZH_CN]: '个人数据',
  },
  biz_paths_dev_only: {
    [Languages.EN]:
      'Visible in the dev container, it will be mounted as the local path in experiment',
    [Languages.ZH_CN]: '开发容器中可见，实验中会挂载为本机路径',
  },
  biz_paths_group_shared_data: {
    [Languages.EN]: 'Group Shared Data',
    [Languages.ZH_CN]: '组共享数据',
  },
  biz_paths_public_dataset: {
    [Languages.EN]: 'Public Dataset',
    [Languages.ZH_CN]: '公共数据集',
  },
  biz_paths_private_dataset: {
    [Languages.EN]: 'Private Dataset',
    [Languages.ZH_CN]: '私有数据集',
  },
  biz_paths_group_shred: {
    [Languages.EN]: 'Group Shared',
    [Languages.ZH_CN]: '组共享',
  },
  base_req_success: {
    [Languages.EN]: 'Request Success',
    [Languages.ZH_CN]: '请求成功',
  },
  base_no_data: {
    [Languages.EN]: 'NO DATA',
    [Languages.ZH_CN]: '没有数据',
  },
  base_highflyer_ai: {
    [Languages.EN]: '{{_ORG}}',
    [Languages.ZH_CN]: '{{_ORG}}',
  },
  biz_nav_overview: {
    [Languages.EN]: 'Overview',
    [Languages.ZH_CN]: '概览',
  },
  biz_nav_containers: {
    [Languages.EN]: 'Containers',
    [Languages.ZH_CN]: '开发容器',
  },
  biz_nav_trainings: {
    [Languages.EN]: 'Experiments',
    [Languages.ZH_CN]: '实验',
  },
  biz_nav_datasets: {
    [Languages.EN]: 'Datasets',
    [Languages.ZH_CN]: '数据集',
  },
  biz_nav_user: {
    [Languages.EN]: 'User',
    [Languages.ZH_CN]: '用户中心',
  },
  biz_remember_me: {
    [Languages.EN]: 'Remember me',
    [Languages.ZH_CN]: '保持登录状态',
  },
  base_sign_in: {
    [Languages.EN]: 'Sign in',
    [Languages.ZH_CN]: '登录',
  },
  biz_experiment_manage_platform: {
    [Languages.EN]: 'Experiment Management',
    [Languages.ZH_CN]: '实验管理',
  },
  biz_provided_token: {
    [Languages.EN]: 'Token provided by platform',
    [Languages.ZH_CN]: '平台提供的 Token',
  },
  biz_current_train_already_wait: {
    [Languages.EN]: 'Waiting',
    // hint: 这里的中文长度会影响对应 title 的美观程度
    [Languages.ZH_CN]: '已经等待',
  },
  biz_current_train_already_run: {
    [Languages.EN]: 'Running',
    // hint: 这里的中文长度会影响对应 title 的美观程度
    [Languages.ZH_CN]: '已经运行',
  },
  biz_max_show_n_tasks: {
    [Languages.EN]:
      'Only show {{n}} experiments at most (The container tasks also occupies the quota, and the actual display here may be less than {{n}})',
    [Languages.ZH_CN]:
      '最多展示 {{n}} 个实验（开发容器也占用实验配额，这里可能实际展示不到 {{n}} 个）',
  },
  biz_current_quota_used: {
    [Languages.EN]: 'Quota Used:',
    [Languages.ZH_CN]: '配额用量：',
  },
  biz_current_trainings_running_l: {
    [Languages.EN]: 'Running Experiments',
    [Languages.ZH_CN]: '运行中的实验',
  },
  biz_current_trainings_waiting_l: {
    [Languages.EN]: 'Waiting Experiments',
    [Languages.ZH_CN]: '排队中的实验',
  },
  biz_current_trainings_more_to_manager: {
    [Languages.EN]: 'Go to Experiments Manager',
    [Languages.ZH_CN]: '更多请前往实验管理',
  },
  biz_dashboard_title: {
    [Languages.EN]: 'Overview',
    [Languages.ZH_CN]: '概览',
  },
  biz_jupyter_manager: {
    [Languages.EN]: 'Jupyter Manager',
    [Languages.ZH_CN]: 'Jupyter 开发环境管理',
  },
  biz_dev_rule: {
    [Languages.EN]: '{{_PLATFORM_NAME}} Documentation',
    [Languages.ZH_CN]: '{{_PLATFORM_NAME}} 官方文档',
  },
  biz_perf_statistics_by: {
    [Languages.EN]: 'Statistics By',
    [Languages.ZH_CN]: '统计对象',
  },
  biz_perf_training_type: {
    [Languages.EN]: 'Experiment Type',
    [Languages.ZH_CN]: '实验类型',
  },
  biz_perf_statistical_interval: {
    [Languages.EN]: 'Statistical Interval',
    [Languages.ZH_CN]: '统计区间',
  },
  biz_perf_total_usage_statistics: {
    [Languages.EN]: 'Total Usage Statistics (up to yesterday)',
    [Languages.ZH_CN]: '总用量统计 (至昨日)',
  },
  biz_perf_total_gpu_hours: {
    [Languages.EN]: 'Total\n GPU hours',
    [Languages.ZH_CN]: '总 GPU 卡时',
  },
  biz_perf_total_training_finished: {
    [Languages.EN]: 'Total\nExperiments Finished',
    [Languages.ZH_CN]: '总完成实验',
  },
  biz_perf_total_avg_gpu_util: {
    [Languages.EN]: 'Total\nAverage GPU Utilization',
    [Languages.ZH_CN]: '总平均 GPU 使用率',
  },
  biz_perf_gpu_trainings: {
    [Languages.EN]: 'GPU Experiments',
    [Languages.ZH_CN]: 'GPU 实验',
  },
  biz_perf_cpu_trainings: {
    [Languages.EN]: 'CPU Experiments',
    [Languages.ZH_CN]: 'CPU 实验',
  },
  biz_perf_already_sub_trainings: {
    [Languages.EN]: 'Submitted\nExperiments',
    [Languages.ZH_CN]: '已提交实验数',
  },
  biz_perf_interrupt_task_count: {
    [Languages.EN]: 'Total Experiment\nInterruptions',
    [Languages.ZH_CN]: '实验打断总计',
  },
  biz_perf_interrupt_task_median: {
    [Languages.EN]: 'Median Experiment\nInterruptions',
    [Languages.ZH_CN]: '实验打断中位数',
  },
  biz_perf_exec_time_mean: {
    [Languages.EN]: 'Average\nRunning Time',
    [Languages.ZH_CN]: '子任务平均运行时长',
  },
  biz_perf_exec_time_median: {
    [Languages.EN]: 'Sub Tasks Median\nRunning Time',
    [Languages.ZH_CN]: '子任务运行时长中位数',
  },
  biz_perf_task_wait_mean: {
    [Languages.EN]: 'Sub Tasks Average\nWaiting Time',
    [Languages.ZH_CN]: '子任务平均等待时间',
  },
  biz_perf_task_wait_median: {
    [Languages.EN]: 'Sub Tasks Median\nWaiting Time',
    [Languages.ZH_CN]: '子任务等待时间中位数',
  },
  biz_perf_short_task_count: {
    [Languages.EN]: 'Short\nExperiments',
    [Languages.ZH_CN]: '短时实验数',
  },
  biz_perf_short_task_count_help: {
    [Languages.EN]: 'The total duration of the chain task less than 15 minutes in the day',
    [Languages.ZH_CN]: 'chain 任务的总时长在当天内小于 15 分钟',
  },
  biz_perf_invalid_task_count: {
    [Languages.EN]: 'Invalid\nSub Tasks',
    [Languages.ZH_CN]: '无效子任务数',
  },
  biz_perf_invalid_task_count_help: {
    [Languages.EN]: 'Sub Tasks under 5 minutes',
    [Languages.ZH_CN]: '时长在 5 分钟以内的子任务数量',
  },
  biz_perf_fail_rate: {
    [Languages.EN]: 'Fail Rate',
    [Languages.ZH_CN]: '实验失败率',
  },
  biz_about_me_days_count: {
    [Languages.EN]: 'Have used the {{_PLATFORM_NAME}} for {{days}} days',
    [Languages.ZH_CN]: '已使用{{_PLATFORM_NAME}} {{days}} 天',
  },
  biz_about_me_group_desc: {
    [Languages.EN]: 'The sharing group you are in',
    [Languages.ZH_CN]: '所在的共享组',
  },
  biz_about_me_avatar_edit_prompt: {
    [Languages.EN]: 'You can edit the avatar in the "Discuss" page',
    [Languages.ZH_CN]: '可以在"{{_STUDIO_DISCUSS}}"页面中编辑头像',
  },
  biz_home_scheduler: {
    [Languages.EN]: 'Experiments Schedule',
    [Languages.ZH_CN]: '实验调度',
  },
  biz_home_performance: {
    [Languages.EN]: 'Performance',
    [Languages.ZH_CN]: '性能指标',
  },
  biz_home_storage: {
    [Languages.EN]: 'Storage',
    [Languages.ZH_CN]: '存储用量',
  },
  biz_home_history_trainings: {
    [Languages.EN]: 'Experiments Statistics',
    [Languages.ZH_CN]: '实验统计',
  },
  biz_home_cluster_overview: {
    [Languages.EN]: 'Cluster Overview',
    [Languages.ZH_CN]: '集群概况',
  },
  biz_home_cluster_spare_overview: {
    [Languages.EN]: 'Spare Computing Power Overview',
    [Languages.ZH_CN]: '闲时算力概况',
  },
  biz_home_help: {
    [Languages.EN]: 'Help',
    [Languages.ZH_CN]: '帮助',
  },
  biz_home_about_me: {
    [Languages.EN]: 'About Me',
    [Languages.ZH_CN]: '关于我',
  },
  biz_home_messages: {
    [Languages.EN]: 'Messages',
    [Languages.ZH_CN]: '消息通知',
  },
  biz_home_rankings: {
    [Languages.EN]: 'Ranking',
    [Languages.ZH_CN]: '龙虎榜',
  },
  biz_perf_gpu_hours: {
    [Languages.EN]: 'GPU hours',
    [Languages.ZH_CN]: 'GPU 时',
  },
  biz_perf_cpu_hours: {
    [Languages.EN]: 'CPU hours',
    [Languages.ZH_CN]: 'CPU 时',
  },
  biz_perf_cpu_rate: {
    [Languages.EN]: 'CPU Utilization',
    [Languages.ZH_CN]: 'CPU 使用率',
  },
  biz_perf_mem_usage: {
    [Languages.EN]: 'Memory Usage',
    [Languages.ZH_CN]: '内存使用率',
  },
  biz_perf_ib_usage: {
    [Languages.EN]: 'IB Usage',
    [Languages.ZH_CN]: 'IB 使用',
  },
  biz_perf_gpu_power: {
    [Languages.EN]: 'GPU Power',
    [Languages.ZH_CN]: 'GPU 功率',
  },
  biz_perf_gpu_rate: {
    [Languages.EN]: 'GPU Utilization',
    [Languages.ZH_CN]: 'GPU 使用率',
  },
  biz_perf_gpu_power_to_util: {
    [Languages.EN]: 'GPU Power to Utilization',
    [Languages.ZH_CN]: 'GPU 功率换算使用率',
  },
  gpu_occupied_percent: {
    [Languages.EN]: 'GPU Occupied',
    [Languages.ZH_CN]: 'GPU 占用率',
  },
  cpu_occupied_percent: {
    [Languages.EN]: 'CPU Occupied',
    [Languages.ZH_CN]: 'CPU 占用率',
  },
  gpu_perf_no_data_period: {
    [Languages.EN]: 'No Data For This Period',
    [Languages.ZH_CN]: '没有该时段的数据',
  },
  biz_user_name: {
    [Languages.EN]: 'User Name',
    [Languages.ZH_CN]: '用户名',
  },
  biz_user_share_group: {
    [Languages.EN]: 'User Group',
    [Languages.ZH_CN]: '所属组',
  },
  biz_user_work_dir: {
    [Languages.EN]: 'Work Directory',
    [Languages.ZH_CN]: '工作路径',
  },
  biz_user_data_dir: {
    [Languages.EN]: 'DataSet Directory',
    [Languages.ZH_CN]: '数据集路径',
  },
  biz_user_basic_env: {
    [Languages.EN]: 'Basic Environment',
    [Languages.ZH_CN]: '基础环境',
  },
  biz_user_resource_quota: {
    [Languages.EN]: 'User Quota',
    [Languages.ZH_CN]: '资源配额',
  },
  biz_user_title: {
    [Languages.EN]: 'User Center',
    [Languages.ZH_CN]: '用户中心',
  },
  biz_user_title_desc: {
    [Languages.EN]: 'User Info & Settings',
    [Languages.ZH_CN]: '个人信息和偏好设置',
  },
  biz_user_setting: {
    [Languages.EN]: 'Settings',
    [Languages.ZH_CN]: '配置',
  },
  biz_rank_my_rank: {
    [Languages.EN]: 'My Rank',
    [Languages.ZH_CN]: '我的排名',
  },
  biz_quota_change_desc: {
    [Languages.EN]: 'Change Quota for Priority {{priority}}',
    [Languages.ZH_CN]: '修改优先级 {{priority}} 的 Quota',
  },
  biz_ensure_change: {
    [Languages.EN]: 'Confirm',
    [Languages.ZH_CN]: '确认修改',
  },
  biz_request_error: {
    [Languages.EN]: 'Request Server Error, please retry later',
    [Languages.ZH_CN]: '请求后端出现错误，请稍后重试',
  },
  biz_render_no_data: {
    [Languages.EN]: 'Error: Render Error',
    [Languages.ZH_CN]: '页面渲染出错',
  },
  biz_load_data_error: {
    [Languages.EN]: 'Module Get Data Error',
    [Languages.ZH_CN]: '模块数据加载出错',
  },
  biz_go_to_monitor: {
    [Languages.EN]: 'Go To Cluster Monitor Page',
    [Languages.ZH_CN]: '跳转至集群监控平台',
  },
  biz_settings_update_success: {
    [Languages.EN]: 'Update Settings Success',
    [Languages.ZH_CN]: '更新配置成功',
  },
  biz_settings_update_error: {
    [Languages.EN]: 'Update Settings Failed: Parse Failed',
    [Languages.ZH_CN]: '更新配置失败：解析失败',
  },
  biz_settings_default: {
    [Languages.EN]: 'Default Settings',
    [Languages.ZH_CN]: '默认配置',
  },
  biz_settings_user: {
    [Languages.EN]: 'User Settings',
    [Languages.ZH_CN]: '用户配置',
  },
  biz_internal_server_error: {
    [Languages.EN]: 'Request {{url}} Internal Server Error',
    [Languages.ZH_CN]: '请求 {{url}} 出现服务端错误',
  },
  biz_jupyter_not_found: {
    [Languages.EN]: 'No Running jupyter Found',
    [Languages.ZH_CN]: '没有找到活跃的 jupyter 实例',
  },
  biz_jupyter_open_pending: {
    [Languages.EN]: 'Open File {{file_name}} in {{jupyter_name}}',
    [Languages.ZH_CN]: '即将在 {{jupyter_name}} 中打开文件 {{file_name}}',
  },
  biz_exp_queue_title: {
    [Languages.EN]: 'Experiments Schedule Queue',
    [Languages.ZH_CN]: '实验调度队列',
  },
  biz_exp_queue_desc: {
    [Languages.EN]: 'Drag to change the order',
    [Languages.ZH_CN]: '拖动以改变实验顺序',
  },
  biz_exp_running_time: {
    [Languages.EN]: 'Running Time',
    [Languages.ZH_CN]: '运行时间',
  },
  biz_exp_waiting_time: {
    [Languages.EN]: 'Waiting Time',
    [Languages.ZH_CN]: '等待时间',
  },
  biz_exp_queue_drag_note_title: {
    [Languages.EN]: 'Instructions',
    [Languages.ZH_CN]: '调整须知',
  },
  biz_got_it: { [Languages.EN]: 'OK', [Languages.ZH_CN]: '了解了' },
  biz_exp_queue_drag_note_callout: {
    [Languages.EN]:
      'According to our current scheduling rules, it is possible that the priority will be modified by cluster scheduling after manual adjustment (for example, when the high-priority quota is not enough but the low-priority quota is sufficient, it will be adjusted to a low priority), or the experiments will be interrupted, both are normal',
    [Languages.ZH_CN]:
      '根据我们目前的调度规则，调整顺序后有可能实验的优先级会被集群调度再次修改（例如当高优先级的配额不够但低优先级的配额充分时，会调整为低优先级），也有可能被打断，均属于正常现象',
  },
  biz_exp_queue_drag_note_callout_external: {
    [Languages.EN]:
      'According to our current scheduling rules, Experiments may be interrupted after manual adjustments',
    [Languages.ZH_CN]: '根据我们目前的调度规则，调整顺序后有可能会造成实验被打断',
  },
  biz_exp_queue_drag_note: {
    [Languages.EN]:
      'You can drag an experiment to other positions of the same priority or different priorities. The rough rules are as follows:',
    [Languages.ZH_CN]: '你可以将实验拖动到同优先级或不同优先级的其他位置，大致调整规则如下：',
  },
  biz_exp_queue_drag_note_not_same_level: {
    [Languages.EN]:
      'For experiments with different priorities, the higher priority is scheduled first',
    [Languages.ZH_CN]: '对于不同优先级实验，高优先级先被调度',
  },
  biz_exp_queue_drag_note_same_level: {
    [Languages.EN]:
      'For experiments with the same priority, according to the FIFO algorithm scheduling, Experiments can be dragged to a higher position to be scheduled faster',
    [Languages.ZH_CN]:
      '对于同优先级实验，按照 FIFO 算法调度，可以将任务拖动到更靠前的位置从而更快地被调度',
  },
  biz_exp_queue_drag_note_external: {
    [Languages.EN]:
      'The experiment is scheduled according to FIFO algorithm. Experiments can be dragged to a higher position to be scheduled faster',
    [Languages.ZH_CN]: '实验按照 FIFO 算法调度，可以将任务拖动到更靠前的位置从而更快地被调度',
  },
  biz_exp_queue_click_show_help: {
    [Languages.EN]: 'Click to Show Instructions',
    [Languages.ZH_CN]: '点击查看调整须知',
  },
  biz_exp_queue_no_task: {
    [Languages.EN]: 'No Experiments',
    [Languages.ZH_CN]: '暂无实验',
  },
  biz_exp_queue_no_task_inner: {
    [Languages.EN]: 'No Experiments, You can drag others to here',
    [Languages.ZH_CN]: '暂无实验，可拖动其他实验至此',
  },
  biz_exp_status_task_nodes: {
    [Languages.EN]: 'Nodes',
    [Languages.ZH_CN]: '节点数',
  },
  biz_exp_queue_drag_success_tip: {
    [Languages.EN]: 'Manual adjustment succeeded',
    [Languages.ZH_CN]: '手动调整成功',
  },
  biz_nav_admin: {
    [Languages.EN]: 'Admin',
    [Languages.ZH_CN]: '管理',
  },
  biz_quota_change_external_desc: {
    [Languages.EN]: 'Change Quota for {{user}}',
    [Languages.ZH_CN]: '修改用户 {{user}} 的配额',
  },
  biz_range_schedule_add: {
    [Languages.EN]: 'Added({{n}}h)',
    [Languages.ZH_CN]: '{{n}} 小时新增',
  },
  biz_range_schedule_finish: {
    [Languages.EN]: 'Finished({{n}}h)',
    [Languages.ZH_CN]: '{{n}} 小时结束',
  },
  biz_container_add_service_handle: {
    [Languages.EN]: 'Manually add services',
    [Languages.ZH_CN]: '手动添加服务',
  },
  biz_container_create_jupyter_fast: {
    [Languages.EN]: 'Create jupyter directly',
    [Languages.ZH_CN]: '直接创建 jupyter',
  },
  biz_container_create_container: {
    [Languages.EN]: 'Create Container',
    [Languages.ZH_CN]: '创建容器',
  },
  biz_container_create_container_external_bind: {
    [Languages.EN]:
      'Before creating a container for the first time, please contact the administrator to bind the GPU (MIG), otherwise an exception may occur.',
    [Languages.ZH_CN]:
      '初次创建容器前，请联系管理员进行 GPU (MIG) 的绑定操作，否则可能会出现创建异常',
  },
  biz_container_create_spot_container: {
    [Languages.EN]: 'Create Spot Container',
    [Languages.ZH_CN]: '创建 Spot 容器',
  },
  biz_container_create_spot_container_no_quota: {
    [Languages.EN]: 'The spot container quota exceeded the limit and cannot be created',
    [Languages.ZH_CN]: 'spot 容器配额超出上限，无法创建',
  },
  biz_container_create_spot_container_max_num_exceeded: {
    [Languages.EN]: 'Insufficient quota to create spot container',
    [Languages.ZH_CN]: '创建 spot 容器的配额不足',
  },
  biz_container_create_spot_container_too_busy_to_create: {
    [Languages.EN]: 'The cluster is busy and the spot container cannot be created temporarily',
    [Languages.ZH_CN]: '集群繁忙，暂时无法创建 spot 容器',
  },
  biz_container_create_spot_container_tip_short: {
    [Languages.EN]:
      'Create a development container with an idle GPU card (may be interrupted at any time due to a busy cluster)',
    [Languages.ZH_CN]: '利用空闲的 GPU 训练卡创建开发容器（可能因集群繁忙随时被打断）',
  },
  biz_container_create_spot_container_tip: {
    [Languages.ZH_CN]:
      '注意：当前你创建的是 spot 开发容器，spot 开发容器为独占 GPU 的开发容器，只有在集群使用率较低且满足特定条件时才允许被启动，spot 开发容器可能因集群繁忙随时被打断。',
    [Languages.EN]:
      'Attention: You are currently creating a spot development container. The spot development container is a development container for exclusive GPU training cards. It is only allowed to be activated when the cluster usage is low and certain conditions are met. The spot development container may be interrupted at any time.',
  },
  biz_container_update_container: {
    [Languages.EN]: 'Update And Restart Container',
    [Languages.ZH_CN]: '更新并重启容器',
  },
  biz_container_update_spot_container: {
    [Languages.EN]: 'Update And Restart Container',
    [Languages.ZH_CN]: '更新并重启 Spot 容器',
  },
  biz_container_cpu_core: {
    [Languages.EN]: 'Cores',
    [Languages.ZH_CN]: '核',
  },
  biz_container_exclusive: {
    [Languages.EN]: 'Exclusive',
    [Languages.ZH_CN]: '独占',
  },
  biz_container_export_no_quota: {
    [Languages.EN]: 'There is no quota to create a new port',
    [Languages.ZH_CN]: '已经没有 quota 创建新的端口',
  },
  biz_container_add_nodeport: {
    [Languages.EN]: 'Add NodePort',
    [Languages.ZH_CN]: '新建暴露端口',
  },
  biz_container_nodeport_for_ssh_tip: {
    [Languages.EN]: '22 for ssh service',
    [Languages.ZH_CN]: '如果想暴露 ssh 服务请填入 22',
  },
  biz_container_log_for_container: {
    [Languages.EN]: 'Container Log',
    [Languages.ZH_CN]: '容器日志',
  },
  biz_container_log_for_sys: {
    [Languages.EN]: 'System Log',
    [Languages.ZH_CN]: '系统日志',
  },
  base_log: {
    [Languages.EN]: 'Log',
    [Languages.ZH_CN]: '日志',
  },
  base_view_service_log: {
    [Languages.EN]: 'View Service Log',
    [Languages.ZH_CN]: '查看服务日志',
  },
  base_view_container_log_tip: {
    [Languages.EN]:
      'Container logs only include the logs of the container itself. To view service logs, please click `More`->`View service log` in the service details.',
    [Languages.ZH_CN]:
      '容器日志只包含容器自身日志，如需查看服务日志请在服务详情点击`更多`->`查看服务日志`',
  },
  biz_container_nodeport_dist_port: {
    [Languages.EN]: 'Port',
    [Languages.ZH_CN]: '端口',
  },
  biz_container_nodeport_alias: {
    [Languages.EN]: 'Alias',
    [Languages.ZH_CN]: '别名',
  },
  biz_container_wander_nodeports: {
    [Languages.EN]: 'Detached Nodeports',
    [Languages.ZH_CN]: '游离的暴露端口',
  },
  biz_container_wander_nodeports_tip: {
    [Languages.EN]: 'You have the following NodePorts that have not been deleted in time',
    [Languages.ZH_CN]:
      '你存在如下游离的暴露端口（容器删除后，对应的暴露端口没有及时被删除），请及时手动删除',
  },
  base_just_delete_all: {
    [Languages.EN]: 'Delete All',
    [Languages.ZH_CN]: '一键删除所有',
  },
  biz_container_list: {
    [Languages.EN]: 'Container List',
    [Languages.ZH_CN]: '我的容器列表',
  },
  base_all_delete_success: {
    [Languages.EN]: 'All deleted successfully',
    [Languages.ZH_CN]: '全部删除成功',
  },
  biz_part_delete_failed: {
    [Languages.EN]: 'Partial deletion failed',
    [Languages.ZH_CN]: '部分删除失败',
  },
  base_address: {
    [Languages.EN]: 'Address',
    [Languages.ZH_CN]: '地址',
  },
  biz_container_origin_port: {
    [Languages.EN]: 'Origin Port',
    [Languages.ZH_CN]: '源端口',
  },
  base_port: {
    [Languages.EN]: 'Port',
    [Languages.ZH_CN]: '端口',
  },
  base_admin: {
    [Languages.EN]: 'Admin',
    [Languages.ZH_CN]: '管理员',
  },
  base_use: {
    [Languages.EN]: 'Use',
    [Languages.ZH_CN]: '使用',
  },
  base_total: {
    [Languages.EN]: 'Total',
    [Languages.ZH_CN]: '总计',
  },
  base_start: {
    [Languages.EN]: 'Start',
    [Languages.ZH_CN]: '启动',
  },
  biz_container_access_after_restart: {
    [Languages.EN]: 'Container Not Running Or Not Ready',
    [Languages.ZH_CN]: '容器未启动或未就绪',
  },
  biz_container_copy_startup_script: {
    [Languages.EN]: 'Copy Startup Script',
    [Languages.ZH_CN]: '拷贝启动脚本',
  },
  biz_copy_ssh_script: {
    [Languages.EN]: 'Copy SSH',
    [Languages.ZH_CN]: '复制 SSH 命令',
  },
  biz_container_basic_info_config: {
    [Languages.EN]: 'Basic Information Config',
    [Languages.ZH_CN]: '基本信息配置',
  },
  biz_container_srvc_info_config: {
    [Languages.EN]: 'Service Config',
    [Languages.ZH_CN]: '服务信息配置',
  },
  biz_dev_container_manage: {
    [Languages.EN]: 'Container Manage',
    [Languages.ZH_CN]: '开发容器管理',
  },
  biz_dev_container_desc: {
    [Languages.EN]: 'Manage jupyter, self-built services and exposed ports',
    [Languages.ZH_CN]: '管理 jupyter、自建服务和暴露的端口',
  },
  biz_container_extra_mounts: {
    [Languages.EN]: 'Extra Mounts',
    [Languages.ZH_CN]: '额外挂载点',
  },
  biz_container_name: {
    [Languages.EN]: 'Container Name',
    [Languages.ZH_CN]: '容器名称',
  },
  biz_container_builtin_service: {
    [Languages.EN]: 'Builtin Service',
    [Languages.ZH_CN]: '内建服务',
  },
  biz_container_custom_service: {
    [Languages.EN]: 'Custom Service',
    [Languages.ZH_CN]: '自定义服务',
  },
  base_name: {
    [Languages.EN]: 'Name',
    [Languages.ZH_CN]: '名称',
  },
  base_edit: {
    [Languages.EN]: 'Edit',
    [Languages.ZH_CN]: '编辑',
  },
  base_user: {
    [Languages.EN]: 'User',
    [Languages.ZH_CN]: '用户',
  },
  base_shared_group: {
    [Languages.EN]: 'Shared Group',
    [Languages.ZH_CN]: '共享组',
  },
  biz_container_startup_script: {
    [Languages.EN]: 'startup script',
    [Languages.ZH_CN]: '启动脚本',
  },
  biz_container_srvc_type: {
    [Languages.EN]: 'Service Type',
    [Languages.ZH_CN]: '服务类型',
  },
  biz_container_custom_srvc_name: {
    [Languages.EN]: 'Custom Service Name',
    [Languages.ZH_CN]: '自定义服务名称',
  },
  biz_container_expose_srvc_pod: {
    [Languages.EN]: 'Expose Service Pod',
    [Languages.ZH_CN]: '暴露服务端口',
  },
  biz_srvc_select_srvc: {
    [Languages.EN]: 'Select Service',
    [Languages.ZH_CN]: '选择服务',
  },
  biz_container_expose_port_type: {
    [Languages.EN]: 'Export Port Type',
    [Languages.ZH_CN]: '暴露端口类型',
  },
  biz_container_expose_type_hint: {
    [Languages.EN]:
      'If you choose http, the route of `$user_name/$container_name/$service_name` will be automatically established',
    [Languages.ZH_CN]: '如果选择 http 会自动建立 `用户名/容器名/服务名` 的路由',
  },
  biz_container_listen_port: {
    [Languages.EN]: 'The port the service is listening on',
    [Languages.ZH_CN]: '服务监听的端口',
  },
  base_save: {
    [Languages.EN]: 'Save',
    [Languages.ZH_CN]: '保存',
  },
  biz_container_only_support_one_line_shell: {
    [Languages.EN]:
      'Only single-line shell scripts are supported, and Please confirm that the relevant execution content has been mounted',
    [Languages.ZH_CN]: '仅支持单行 shell 脚本，同时请确认相关执行内容位于挂载目录内',
  },
  biz_container_start_script_not_empty: {
    [Languages.EN]: 'Startup script cannot be empty',
    [Languages.ZH_CN]: '启动脚本不能为空',
  },
  biz_container_srvc_name_not_empty: {
    [Languages.EN]: 'Service name cannot be empty',
    [Languages.ZH_CN]: '服务名称不能为空',
  },
  biz_container_service: {
    [Languages.EN]: 'Service',
    [Languages.ZH_CN]: '服务',
  },
  biz_container_no_group_available: {
    [Languages.EN]: 'No Group Available, Please contact the administrator to add',
    [Languages.ZH_CN]: '没有可用的分组，请联系管理员添加',
  },
  biz_container_no_env_available: {
    [Languages.EN]: 'No Environment Available',
    [Languages.ZH_CN]: '没有可用的环境',
  },
  biz_container_create_please_set_name: {
    [Languages.EN]: 'Please set Container Name',
    [Languages.ZH_CN]: '请设置容器名称',
  },
  biz_container_create_please_set_cpu_and_mem: {
    [Languages.EN]: 'Please set cpu and memory to a value greater than 1',
    [Languages.ZH_CN]: '请设置 cpu 和内存为大于 1 的值',
  },
  base_access: {
    [Languages.EN]: 'Access',
    [Languages.ZH_CN]: '访问',
  },
  biz_container_create_success: {
    [Languages.EN]: 'Created successfully, the list will be updated automatically later',
    [Languages.ZH_CN]: '创建成功，稍后列表会自动更新',
  },
  biz_container_checkpoint: {
    [Languages.EN]: 'CheckPoint',
    [Languages.ZH_CN]: '持久化',
  },
  biz_input_check_failed: {
    [Languages.EN]: 'Input validation failed, please double check',
    [Languages.ZH_CN]: '输入校验失败，请检查',
  },
  base_delete_success: {
    [Languages.EN]: 'Delete Success',
    [Languages.ZH_CN]: '删除成功',
  },
  base_delete_error: {
    [Languages.EN]: 'Delete Error',
    [Languages.ZH_CN]: '删除失败',
  },
  base_create_success: {
    [Languages.EN]: 'Create Success',
    [Languages.ZH_CN]: '创建成功',
  },
  biz_container_quota_used_up: {
    [Languages.EN]:
      'Your quota has been used up. If you want to queue the container to run, please stop the running container in time',
    [Languages.ZH_CN]: '你的 quota 已用满，如果希望排队容器运行，请及时停止运行中的容器',
  },
  base_contains: {
    [Languages.EN]: 'Contains',
    [Languages.ZH_CN]: '包含',
  },
  base_please_filter: {
    [Languages.EN]: 'Please enter right filter criteria',
    [Languages.ZH_CN]: '请输入正确的筛选条件',
  },
  biz_please_enter_content: {
    [Languages.EN]: 'Please enter specific content',
    [Languages.ZH_CN]: '请输入具体内容',
  },
  biz_container_please_save_edit_svc: {
    [Languages.EN]: 'Please save all edited services',
    [Languages.ZH_CN]: '请保存所有编辑状态的服务',
  },
  biz_container_service_type: {
    [Languages.EN]: 'Service Type',
    [Languages.ZH_CN]: '服务类型',
  },
  biz_container_no_custom_svc_quota_tip: {
    [Languages.EN]:
      'There is no quota for creating custom services. If you need to activate it, please contact us according to the prompt information at the bottom of the page.',
    [Languages.ZH_CN]: '没有创建自定义服务的配额，如需开通请根据页面底部提示信息联系我们。',
  },
  biz_container_create_multi_tip: {
    [Languages.EN]: 'A container can configure multiple services and run at the same time',
    [Languages.ZH_CN]:
      '一个容器可以配置多个服务，同时运行（注意：当前处于新旧功能过渡阶段，目前即使删掉 jupyter，也会默认启动）',
  },
  biz_container_please_set_name: {
    [Languages.EN]: 'Please input Container Name',
    [Languages.ZH_CN]: '请设置容器别名',
  },
  biz_container_start_script: {
    [Languages.EN]: 'Service Start Script',
    [Languages.ZH_CN]: '服务启动脚本',
  },
  biz_footer_statement: {
    [Languages.EN]: '{{_COPYRIGHT}}',
    [Languages.ZH_CN]: '{{_COPYRIGHT}}',
  },
  biz_container_current_user_avail: {
    [Languages.EN]: 'Current Quota: ',
    [Languages.ZH_CN]: '最大配额：',
  },
  biz_container_edit_container: {
    [Languages.EN]: 'Edit Container',
    [Languages.ZH_CN]: '编辑容器信息',
  },
  biz_container_restart_container: {
    [Languages.EN]: 'Restart Container',
    [Languages.ZH_CN]: '重启容器',
  },
  biz_container_process_exit: {
    [Languages.EN]: 'Detected that the process has exited, please restart the container to restore',
    [Languages.ZH_CN]: '检测到进程已经退出，可以手动启动该服务恢复',
  },
  biz_container_watch_status_enable: {
    [Languages.EN]: 'Enable process monitoring',
    [Languages.ZH_CN]: '开启进程监控',
  },
  biz_container_watch_status_enable_tip: {
    [Languages.EN]:
      'After the process monitoring is turned on, the container will be closed if the service process does not exist',
    [Languages.ZH_CN]: '开启进程监控后，服务进程不存在容器将被关闭',
  },
  biz_container_creator_view_env: {
    [Languages.EN]: 'View available environment variables',
    [Languages.ZH_CN]: '查看可用的环境变量',
  },
  biz_container_creator_view_service_name: {
    [Languages.EN]: 'Service Name',
    [Languages.ZH_CN]: '服务名',
  },
  biz_tutorial: {
    [Languages.EN]: 'Tutorial',
    [Languages.ZH_CN]: '入门指导',
  },
  biz_container_admin_search_easy_tip: {
    [Languages.EN]: 'separate keyword by space, and return result contains one of the keywords',
    [Languages.ZH_CN]: '通过空格分隔关键字列表，查询结果包含任一关键字',
  },
  biz_container_admin_search_easy: {
    [Languages.EN]: 'Simple',
    [Languages.ZH_CN]: '简易',
  },
  biz_container_admin_search_exact: {
    [Languages.EN]: 'Exact',
    [Languages.ZH_CN]: '精确',
  },
  biz_xtopic_nav: {
    [Languages.EN]: '{{_STUDIO_DISCUSS}}',
    [Languages.ZH_CN]: '{{_STUDIO_DISCUSS}}',
  },
  biz_current_train_move_to_head: {
    [Languages.EN]: 'Move To The First',
    [Languages.ZH_CN]: '移动至队头',
  },
  biz_storage_data_collect_time: {
    [Languages.EN]: 'Data collected at',
    [Languages.ZH_CN]: '数据采集时间',
  },
  biz_storage_data_collect_no_time: {
    [Languages.EN]: 'No data collection time',
    [Languages.ZH_CN]: '无数据采集时间',
  },
  biz_home_dnd_order_first: {
    [Languages.EN]: 'Default',
    [Languages.ZH_CN]: '默认',
  },
  biz_home_dnd_order_custom: {
    [Languages.EN]: 'Custom',
    [Languages.ZH_CN]: '自定义',
  },
  biz_home_dnd_order_storage_first: {
    [Languages.EN]: 'Storage First',
    [Languages.ZH_CN]: '存储优先',
  },
  biz_home_dnd_order_statistic_first: {
    [Languages.EN]: 'Statistics First',
    [Languages.ZH_CN]: '统计数据优先',
  },
  biz_home_dnd_order_update_success: {
    [Languages.EN]: 'Update panel order strategy succeeded',
    [Languages.ZH_CN]: '更新面板顺序成功',
  },
  biz_home_dnd_drag_prompt: {
    [Languages.EN]: 'Drag to change panel order',
    [Languages.ZH_CN]: '拖拽改变面板顺序',
  },
  biz_home_dnd_minimize: {
    [Languages.EN]: 'Minimize the panel',
    [Languages.ZH_CN]: '最小化面板',
  },
  biz_home_dnd_switch_layout: {
    [Languages.EN]: 'Switch Layout',
    [Languages.ZH_CN]: '切换布局',
  },
  biz_base_current: {
    [Languages.EN]: 'Current',
    [Languages.ZH_CN]: '当前',
  },
  biz_storage_out_out_limit: {
    [Languages.EN]: 'Exceed',
    [Languages.ZH_CN]: '超限',
  },
  biz_storage_dev_space: {
    [Languages.EN]: 'My Dev Space (Jupyter)',
    [Languages.ZH_CN]: '我的开发区用量 (Jupyter)',
  },
  biz_storage_workspace: {
    [Languages.EN]: 'My Workspace',
    [Languages.ZH_CN]: '我的工作区用量 (Workspace)',
  },
  biz_storage_group_dataset_dir: {
    [Languages.EN]: 'Group Dataset',
    [Languages.ZH_CN]: '组私有数据集用量',
  },
  biz_storage_group_shared_total: {
    [Languages.EN]: 'Group Shared',
    [Languages.ZH_CN]: '组共享目录用量',
  },
  biz_storage_group_workspace_total: {
    [Languages.EN]: 'Group Workspace',
    [Languages.ZH_CN]: '组工作区用量',
  },
  biz_storage_exceed_tip: {
    [Languages.EN]:
      'Experiments will not be scheduled after the storage usage exceeds the limit. You need to clean the workspace and ',
    [Languages.ZH_CN]: '存储使用超限后不支持任务运行，需要清理工作区并手动\n',
  },
  biz_storage_exceed_apply_quota: {
    [Languages.EN]: 'Apply Recovery',
    [Languages.ZH_CN]: '申请恢复',
  },
  biz_storage_quota_apply_tip: {
    [Languages.ZH_CN]: '空间清理完成后，申请恢复',
    [Languages.EN]: 'I have confirmed that the space cleaning is completed and apply for Recovery',
  },
  biz_storage_quota_may_not_success: {
    [Languages.EN]:
      'The current workspace usage still exceeds the limit, and may not be able to apply successfully',
    [Languages.ZH_CN]: '当前工作区使用仍然超过限制，可能无法申请成功',
  },
  biz_storage_quota_limit: {
    [Languages.EN]: 'Limit',
    [Languages.ZH_CN]: '限制',
  },
  biz_storage_quota_path: {
    [Languages.EN]: 'Path',
    [Languages.ZH_CN]: '路径',
  },
  biz_storage_quota_update_time: {
    [Languages.EN]: 'Update Time',
    [Languages.ZH_CN]: '统计更新时间',
  },
  biz_storage_quota_ensure_apply: {
    [Languages.EN]: 'Ensure Apply',
    [Languages.ZH_CN]: '确认申请',
  },
  biz_storage_quota_recover_succ: {
    [Languages.EN]: 'Apply Success',
    [Languages.ZH_CN]: '恢复配额申请成功',
  },
  biz_exp_status_init_priority: {
    [Languages.EN]: 'Init Priority',
    [Languages.ZH_CN]: '创建时优先级',
  },
  biz_exp_no_task_found_nano: {
    [Languages.EN]: 'NO TASK',
    [Languages.ZH_CN]: '无任务',
  },
  biz_exp_experiment_detail: {
    [Languages.EN]: 'Experiment Detail',
    [Languages.ZH_CN]: '任务详情',
  },
  biz_onboarding_binding: {
    [Languages.EN]:
      'Try out our brand-new task assistant, which gets rid of the previous singleton file binding. No multiple tabs for each python file any more!',
    [Languages.ZH_CN]:
      '目前新版插件去掉了全局绑定逻辑，可以从这里点开管理每一个 python 文件对应的任务。',
  },
  biz_onboarding_quota: {
    [Languages.EN]:
      'The quota information moved here, and some global information will be added here in the future.',
    [Languages.ZH_CN]: 'Quota 信息转移到这里，后续这里还会新增一些全局信息。',
  },
  biz_exp_log_refreshed: {
    [Languages.EN]: 'Get log for {{name}} - {{rank}} succeeded',
    [Languages.ZH_CN]: '获取 {{name}} - {{rank}} 日志成功',
  },
  biz_error_report_desc: {
    [Languages.EN]:
      'Click download to automatically download the log. Feed back to us with the problem description',
    [Languages.ZH_CN]: '请点击确认自动下载日志，和错误描述一起反馈到平台',
  },
  biz_create_not_valid_environment: {
    [Languages.EN]: 'Not a valid environment.',
    [Languages.ZH_CN]: '当前环境不是有效的环境',
  },
  base_Retry: {
    [Languages.EN]: 'Retry',
    [Languages.ZH_CN]: '重试',
  },
  base_Settings: {
    [Languages.EN]: 'Settings',
    [Languages.ZH_CN]: '设置',
  },
  biz_commands_new_sh: {
    [Languages.EN]: 'New .sh file',
    [Languages.ZH_CN]: '新建 .sh 文件',
  },
  biz_commands_new_ipynb: {
    [Languages.EN]: 'new Notebook(.ipynb) file',
    [Languages.ZH_CN]: '新建 Notebook(.ipynb) 文件',
  },
  biz_commands_create_new_sh: {
    [Languages.EN]: 'Create a new .sh file',
    [Languages.ZH_CN]: '创建新的 .sh 文件',
  },
  biz_commands_create_new_ipynb: {
    [Languages.EN]: 'Create a new Notebook(.ipynb) file',
    [Languages.ZH_CN]: '创建新的 Notebook(.ipynb) 文件',
  },
  biz_zen_mode_confirm: {
    [Languages.EN]:
      "\nIsolated Mode: In a single browser tab, only one active python file or training management panel is allowed. \nIn this mode, opening a .py file in the file manager or jumping to a task's source code in the training management will cause a new browser tab opened. \n\nBefore opening, please make sure to save all the files on this page. After clicking confirm, this page will jump to the training management and enter the Isolated mode.",
    [Languages.ZH_CN]:
      '\n隔离模式，即单个浏览器标签页中，【只允许存在一个】活动的 python 文件或训练管理面板。\n此模式下，在文件管理器打开 .py 文件，或者在训练管理中跳转到任务源代码，都会开新的浏览器标签。\n\n开启前，请先确认对本页面文件都进行了保存。点击确认后此页面会跳转到训练管理并进入隔离模式。',
  },
  biz_exp_log_module: {
    [Languages.EN]:
      'Currently using the old version of the log component, whether to switch to the new version? ',
    [Languages.ZH_CN]: '当前使用的是旧版日志组件，是否切换为新版？',
  },
  biz_exp_log_module_change_success: {
    [Languages.EN]: 'Switched successfully, refresh the page to enable',
    [Languages.ZH_CN]: '切换成功，刷新页面生效',
  },
  biz_hfhub_control_panel: {
    [Languages.EN]: 'HfHub Control Panel',
    [Languages.ZH_CN]: 'HfHub 控制面板',
  },
  io_tip_connecting: {
    [Languages.EN]: 'Establishing real-time update link...',
    [Languages.ZH_CN]: '正在建立实时更新链接...',
  },
  base_hours: {
    [Languages.EN]: 'hours',
    [Languages.ZH_CN]: '时',
  },
  base_minutes: {
    [Languages.EN]: 'minutes',
    [Languages.ZH_CN]: '分',
  },
  base_seconds: {
    [Languages.EN]: 'seconds',
    [Languages.ZH_CN]: '秒',
  },
  biz_renew_succ: {
    [Languages.EN]: 'Renew Success',
    [Languages.ZH_CN]: '续期成功',
  },
  biz_renew_error: {
    [Languages.EN]: 'Renew Error, Internal Server Error',
    [Languages.ZH_CN]: '续期失败，请求服务端错误',
  },
  biz_renew_current_renew_time: {
    [Languages.EN]: 'Current Remaining Running Time',
    [Languages.ZH_CN]: '当前剩余运行时间',
  },
  biz_renew_running_time: {
    [Languages.EN]: 'Running Elapsed Time',
    [Languages.ZH_CN]: '已运行时间',
  },
  biz_renew_quota: {
    [Languages.EN]: 'Remaining Renew Quota',
    [Languages.ZH_CN]: '剩余可续期次数',
  },
  biz_renew_quota_no_limit: {
    [Languages.EN]: 'No Limit',
    [Languages.ZH_CN]: '无限制',
  },
  biz_renew_each_time: {
    [Languages.EN]: 'Single Renew Time',
    [Languages.ZH_CN]: '单次续期时间',
  },
  biz_renew: {
    [Languages.EN]: 'Renew',
    [Languages.ZH_CN]: '续期',
  },
  biz_confirm_to_renew: {
    [Languages.EN]: 'Confirm Renew',
    [Languages.ZH_CN]: '确认续期',
  },
  biz_renew_desc: {
    [Languages.EN]:
      'In order to improve the efficiency of resource usage, after the countdown is over, if there is no renewal, the Jupyter instance will be automatically destroyed',
    [Languages.ZH_CN]:
      '为了提高资源的使用效率，在倒计时结束后，如果没有进行续期，Jupyter 实例会自动销毁。',
  },
  biz_renew_already_destroyed: {
    [Languages.EN]: 'Jupyter Already Destroyed',
    [Languages.ZH_CN]: 'Jupyter 实例已经自动销毁。',
  },
  biz_renew_already_destroyed_tip: {
    [Languages.EN]: 'If you need to use it again, please go back to the control panel and restart',
    [Languages.ZH_CN]: '如果需要再次使用，请返回控制面板重启',
  },
  biz_renew_return: {
    [Languages.EN]: 'Return Control Panel',
    [Languages.ZH_CN]: '返回控制面板',
  },
  biz_renew_tip_content: {
    [Languages.EN]:
      'Jupyter will restart automatically after {{time}}, you can click Renew to extend the usage time',
    [Languages.ZH_CN]: '{{time}} 之后 jupyter 将自动销毁，可以点击续期延长使用时间',
  },
  biz_renew_tip_content_spot: {
    [Languages.EN]:
      'Jupyter will restart automatically after {{time}}, you can click Renew to extend the usage time\nWhen the cluster is busy, the spot container will be interrupted and retracted',
    [Languages.ZH_CN]:
      '{{time}} 之后 jupyter 将自动销毁，可以点击续期延长使用时间（集群繁忙时，spot 容器会被打断收回）',
  },
  biz_renew_onboarding: {
    [Languages.EN]:
      'In order to improve efficiency, Jupyter adds timing and renewal functions, users can renew Jupyter before expiration to extend the use time of Jupyter',
    [Languages.ZH_CN]:
      '为了提高效率，Jupyter 新增定时和续期功能，用户可以在到期之前续期以延长 Jupyter 的使用时间',
  },
  biz_dynamic_quota_tip: {
    [Languages.EN]:
      'The platform has been upgraded to dynamic priority. No need to manually set up Quota',
    [Languages.ZH_CN]: '集群调度已经升级为动态优先级，无需手动设置 Quota',
  },
  biz_info_nodes_free_or_schedule: {
    [Languages.EN]: 'Free/Scheduling',
    [Languages.ZH_CN]: '空闲/调度中',
  },
  biz_io_disconnected_already: {
    [Languages.EN]:
      'An error is detected on the cluster server, and the websocket is already disconnected',
    [Languages.ZH_CN]: '检测到集群服务端出错，主动断开长链接',
  },
  biz_not_allowed_for_studio: {
    [Languages.EN]: 'Currently not authorized to access the page, about to jump to the login page',
    [Languages.ZH_CN]: '当前无权访问页面，即将跳转至登录页面',
  },
})

const i18nKeysRaw = Object.keys(copyWriting) as Array<keyof typeof copyWriting>
type CopyWriteKey = keyof typeof copyWriting
type I18nKeys = {
  [key in CopyWriteKey]: CopyWriteKey
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const i18nKeys = i18nKeysRaw.reduce((curr, next) => {
  // @ts-expect-error ignore
  curr[next] = next
  return curr
}, {}) as I18nKeys
