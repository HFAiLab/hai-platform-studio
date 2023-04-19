import { HAI_FOOT_STATEMENT_CN } from '@hai-platform/shared'
import type { RouteRecordRaw } from 'vue-router'
import MonitorLayout from '@/components/layouts/MonitorLayout.vue'
import UsersJupyter from '@/components/pages/monitor-users/UsersJupyter.vue'
import UsersTraining from '@/components/pages/monitor-users/UsersTraining.vue'
import MonitorNodes from '@/pages/MonitorNodes.vue'
import MonitorUsers from '@/pages/MonitorUsers.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'home',
    path: '/',
    redirect: '/monitor/users/training/GPU',
    component: MonitorLayout,
    meta: { title: HAI_FOOT_STATEMENT_CN, icon: 'i-ant-design:team-outlined' },
    children: [
      {
        path: '/monitor/users',
        component: MonitorUsers,
        redirect: '/monitor/users/training/GPU',
        meta: { title: '用户视图', icon: 'i-ant-design:team-outlined', order: 3 },
        children: [
          {
            path: '/monitor/users/training/:type?',
            name: 'training',
            component: UsersTraining,
            meta: { title: '训练用户', children: true },
          },
          {
            path: '/monitor/users/jupyter',
            name: 'jupyter',
            component: UsersJupyter,
            meta: { title: 'Jupyter 用户', children: true },
          },
        ],
      },
      {
        path: '/monitor/nodes',
        component: MonitorNodes,
        meta: { title: '节点视图', icon: 'i-ant-design:node-index-outlined', order: 4 },
      },
    ],
  },
  {
    path: '/auth',
    redirect: '/auth/login',
    meta: { title: '登录' },
    children: [
      {
        name: 'login',
        path: '/auth/login',
        component: () => import('@/pages/Login.vue'),
        meta: { title: '登录', skipAuth: true },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

declare module 'vue-router' {
  interface RouteMeta {
    icon?: string
    skipAuth?: boolean
    title: string
    children?: boolean
  }
}
