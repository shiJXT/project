<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo-container">
        <img :src="logoBase64" alt="Logo" class="logo">
        <h1 class="title">库存管理系统</h1>
      </div>
      
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :router="true"
          :collapse="isCollapse"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-sub-menu index="basic">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>基础数据管理</span>
            </template>
            <el-menu-item index="/basic/suppliers">供应商管理</el-menu-item>
            <el-menu-item index="/basic/employees">员工管理</el-menu-item>
            <el-menu-item index="/basic/products">商品管理</el-menu-item>
            <el-menu-item index="/basic/shelves">货架管理</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="inventory">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>商品库存管理</span>
            </template>
            <el-menu-item index="/inventory/query">库存查询</el-menu-item>
            <el-menu-item index="/inventory/warning">库存预警</el-menu-item>
            <el-menu-item index="/inventory/check">库存盘点</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="inbound">
            <template #title>
              <el-icon><Download /></el-icon>
              <span>入库管理</span>
            </template>
            <el-menu-item index="/inbound/purchase">采购入库</el-menu-item>
            <el-menu-item index="/inbound/transfer">调拨入库</el-menu-item>
            <el-menu-item index="/inbound/receipt">到货管理</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="outbound">
            <template #title>
              <el-icon><Upload /></el-icon>
              <span>出库管理</span>
            </template>
            <el-menu-item index="/outbound/sale">销售出库</el-menu-item>
            <el-menu-item index="/outbound/transfer">调拨出库</el-menu-item>
            <el-menu-item index="/outbound/picking">出库拣货</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/users">用户权限</el-menu-item>
            <el-menu-item index="/system/settings">系统设置</el-menu-item>
            <el-menu-item index="/system/logs">操作日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPath }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-space>
            <el-tooltip content="全屏" placement="bottom">
              <el-icon class="action-icon" @click="toggleFullscreen">
                <FullScreen />
              </el-icon>
            </el-tooltip>
            
            <el-badge :value="3" class="notice-badge">
              <el-tooltip content="消息通知" placement="bottom">
                <el-icon class="action-icon">
                  <Bell />
                </el-icon>
              </el-tooltip>
            </el-badge>
            
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span class="username">{{ userStore.userInfo.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <el-icon><User /></el-icon>个人信息
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-icon><Setting /></el-icon>系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
      </el-header>
      
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { logoBase64 } from '@/assets/logo.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)
const currentPath = computed(() => route.meta.title || route.name)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  padding: 10px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.title {
  color: #fff;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
}

.action-icon {
  font-size: 20px;
  cursor: pointer;
  padding: 0 10px;
  color: #666;
  transition: color 0.3s;
}

.action-icon:hover {
  color: #409EFF;
}

.notice-badge :deep(.el-badge__content) {
  z-index: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 10px;
}

.username {
  font-size: 14px;
  color: #666;
}

.main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 