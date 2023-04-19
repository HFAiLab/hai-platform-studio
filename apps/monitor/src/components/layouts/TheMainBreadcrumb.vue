<script setup lang="ts">
import type { BreadcrumbProps } from 'ant-design-vue'
import { Breadcrumb } from 'ant-design-vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbRoutes = computed<Required<BreadcrumbProps>['routes']>(() =>
  route.matched.map((item) => ({
    path: item.path,
    breadcrumbName: item.meta.title,
    icon: item.meta.icon,
    children: item.children?.map((childItem) => ({
      path: childItem.path,
      breadcrumbName: childItem.meta?.title ?? '',
      icon: childItem.meta?.icon,
    })),
  })),
)
</script>

<template>
  <Breadcrumb :routes="breadcrumbRoutes">
    <template #itemRender="slotProps">
      <span
        v-if="slotProps.route.icon && slotProps.routes.includes(slotProps.route)"
        class="anticon"
        :class="slotProps.route.icon"
      />
      <span v-if="slotProps.routes.indexOf(slotProps.route) === slotProps.routes.length - 1">
        {{ slotProps.route.breadcrumbName }}
      </span>
      <RouterLink v-else :to="slotProps.route.path">
        {{ slotProps.route.breadcrumbName }}
      </RouterLink>
    </template>
  </Breadcrumb>
</template>
