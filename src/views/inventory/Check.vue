<template>
  <div class="inventory-check-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存盘点</span>
          <el-button type="primary" @click="handleStartCheck">开始盘点</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="盘点单号" width="120" />
        <el-table-column prop="date" label="盘点日期" width="180" />
        <el-table-column prop="area" label="盘点区域" width="120" />
        <el-table-column prop="operator" label="盘点人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difference" label="差异数" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === '待确认'"
              @click="handleConfirm(scope.row)"
            >
              确认
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    id: 'C001',
    date: '2024-01-01',
    area: 'A区',
    operator: '张三',
    status: '待确认',
    difference: 5
  }
])

const getStatusType = (status) => {
  const types = {
    '进行中': 'warning',
    '待确认': 'info',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const handleStartCheck = () => {
  // 实现开始盘点逻辑
}

const handleView = (row) => {
  // 实现查看详情逻辑
}

const handleConfirm = (row) => {
  // 实现确认盘点逻辑
}
</script>

<style scoped>
.inventory-check-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 