<script setup lang="ts">
import { LayoutSider, Menu, MenuItem, SubMenu } from 'ant-design-vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSidebar, useTheme } from '@/composables'
import { DEFAULT_ROUTER_ORDER } from '@/config'
import { LAYOUT } from '@/constants'
import { useAuthRouter } from '@/stores/auth-router'

const route = useRoute()
const theme = useTheme()
const { isCollapsed } = useSidebar()
const selectedKeys = computed(() => {
  const parentPath = route.path.split('/').slice(0, 3).join('/')
  return [parentPath]
})

const authRouterStore = useAuthRouter()

const menuItems = computed(() => {
  const menuRoutes = authRouterStore.authorizedRoutes
    .filter((item) => item.path.includes('/monitor'))
    .sort(
      (a, b) =>
        // || DEFAULT_ROUTER_ORDER 是为了保护不写 index 的时候不报错
        ((a.meta.order as number) || DEFAULT_ROUTER_ORDER) -
        ((b.meta.order as number) || DEFAULT_ROUTER_ORDER),
    )

  return menuRoutes.map((item) => ({
    key: item.path
      .split('/')
      .filter((m) => !m.startsWith(':'))
      .join('/'),
    path: item.path
      .split('/')
      .filter((m) => !m.startsWith(':'))
      .join('/'),
    icon: item.meta?.icon,
    title: item.meta?.title,
    parent: item.children.length > 0,
    leaf: item.meta?.children ?? false,
  }))
})
</script>

<template>
  <LayoutSider
    v-model:collapsed="isCollapsed"
    class="h-screen top-0 left-0 bottom-0 z-10"
    breakpoint="xl"
    collapsible
    :width="LAYOUT.SIDEBAR_WIDTH"
    :collapsed-width="LAYOUT.SIDEBAR_WIDTH_COLLAPSED"
    :theme="theme"
    :style="{ position: 'fixed' }"
  >
    <Menu
      mode="inline"
      :selected-keys="selectedKeys"
      :style="{ height: '100%', borderRight: 0 }"
      :theme="theme"
    >
      <template v-for="item in menuItems" :key="item.key">
        <MenuItem v-if="!item.parent && !item.leaf" :key="item.key">
          <template v-if="item.icon" #icon>
            <span :class="item.icon" />
          </template>
          <RouterLink :to="item.path">
            {{ item.title }}
          </RouterLink>
        </MenuItem>
        <SubMenu v-if="item.parent && !item.leaf" :key="item.key">
          <template v-if="item.icon" #icon>
            <span :class="item.icon" />
          </template>
          <template #title>{{ item.title }}</template>
          <template
            v-for="subItem in menuItems.filter((i) => i.leaf && i.path.startsWith(item.path))"
            :key="subItem.name"
          >
            <MenuItem>
              <RouterLink :to="subItem.path">
                {{ subItem.title }}
              </RouterLink>
            </MenuItem>
          </template>
        </SubMenu>
      </template>
    </Menu>
  </LayoutSider>
</template>
