<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import NodeList from '@/components/NodeList.vue'
import type { NodesGroupsTreeItem } from '@/data'

const props = defineProps<{
  item: NodesGroupsTreeItem
  maxDisplayedNodesCount: number
}>()

const hasClickedShowMore = ref(false)
const currentMaxDisplayedNodesCount = ref(props.maxDisplayedNodesCount)
const hasReachedMaxDisplayNodes = computed(
  () => props.item.nodes.length > currentMaxDisplayedNodesCount.value,
)
const nodes = computed(() => props.item.nodes.slice(0, currentMaxDisplayedNodesCount.value))
const onClickShowMore = (): void => {
  currentMaxDisplayedNodesCount.value += props.maxDisplayedNodesCount
  hasClickedShowMore.value = true
}

watch(
  () => props.maxDisplayedNodesCount,
  (val) => {
    // 如果还没有点击过“显示更多”
    if (!hasClickedShowMore.value) {
      currentMaxDisplayedNodesCount.value = val
    }
    // 如果已点击过“显示更多”，但新的最大展示数量大于当前值，重置“显示更多”状态
    else if (val > currentMaxDisplayedNodesCount.value) {
      currentMaxDisplayedNodesCount.value = val
      hasClickedShowMore.value = false
    }
  },
)
</script>

<template>
  <NodeList class="mb-2" :nodes="nodes">
    <template #after>
      <span v-if="hasReachedMaxDisplayNodes">
        <span>... 共 {{ item.nodes.length }} 个节点</span>
        <Button type="link" @click="onClickShowMore"> 显示更多 </Button>
      </span>
    </template>
  </NodeList>
</template>
