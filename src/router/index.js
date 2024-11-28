import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      // 基础数据管理
      {
        path: 'basic',
        children: [
          {
            path: 'suppliers',
            name: 'Suppliers',
            component: () => import('@/views/basic/Suppliers.vue')
          },
          {
            path: 'employees',
            name: 'Employees',
            component: () => import('@/views/basic/Employees.vue')
          },
          {
            path: 'products',
            name: 'Products',
            component: () => import('@/views/basic/Products.vue')
          },
          {
            path: 'shelves',
            name: 'Shelves',
            component: () => import('@/views/basic/Shelves.vue')
          }
        ]
      },
      // 库存管理
      {
        path: 'inventory',
        children: [
          {
            path: 'query',
            name: 'InventoryQuery',
            component: () => import('@/views/inventory/Query.vue')
          },
          {
            path: 'warning',
            name: 'InventoryWarning',
            component: () => import('@/views/inventory/Warning.vue')
          },
          {
            path: 'check',
            name: 'InventoryCheck',
            component: () => import('@/views/inventory/Check.vue')
          }
        ]
      },
      // 入库管理
      {
        path: 'inbound',
        children: [
          {
            path: 'purchase',
            name: 'PurchaseInbound',
            component: () => import('@/views/inbound/Purchase.vue')
          },
          {
            path: 'transfer',
            name: 'TransferInbound',
            component: () => import('@/views/inbound/Transfer.vue')
          },
          {
            path: 'receipt',
            name: 'Receipt',
            component: () => import('@/views/inbound/Receipt.vue')
          }
        ]
      },
      // 出库管理
      {
        path: 'outbound',
        children: [
          {
            path: 'sale',
            name: 'SaleOutbound',
            component: () => import('@/views/outbound/Sale.vue')
          },
          {
            path: 'transfer',
            name: 'TransferOutbound',
            component: () => import('@/views/outbound/Transfer.vue')
          },
          {
            path: 'picking',
            name: 'Picking',
            component: () => import('@/views/outbound/Picking.vue')
          }
        ]
      },
      // 系统管理
      {
        path: 'system',
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/system/Users.vue')
          },
          {
            path: 'settings',
            name: 'Settings',
            component: () => import('@/views/system/Settings.vue')
          },
          {
            path: 'logs',
            name: 'Logs',
            component: () => import('@/views/system/Logs.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    if (userStore.token && to.path === '/login') {
      next('/')
    } else {
      next()
    }
  }
})

export default router 