<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue'
import { Tree } from 'ant-design-vue'
import type { NodesGroupsTreeItem } from '@/data'
import NodesGroupsTreeLeaf from './NodesGroupsTreeLeaf.vue'

defineProps<{
  data: NodesGroupsTreeItem[]
  maxDisplayedNodesCount: number
}>()

const fieldNames: TreeProps['fieldNames'] = {
  title: 'name',
}
const showLine: TreeProps['showLine'] = {
  showLeafIcon: false,
}
</script>

<template>
  <Tree
    :default-expand-all="true"
    :field-names="fieldNames"
    :selectable="false"
    :show-line="showLine"
    :tree-data="data"
  >
    <template #title="item">
      <!-- 非叶子节点，展示分组名称和节点数量 -->
      <template v-if="!item.isLeaf">
        <span class="font-mono">{{ item.name }} {{ `[${item.nodes.length}]` }}</span>
      </template>

      <!-- 叶子节点，展示所有节点元素 -->
      <template v-else>
        <NodesGroupsTreeLeaf :item="item" :max-displayed-nodes-count="maxDisplayedNodesCount" />
      </template>
    </template>
  </Tree>
</template>
