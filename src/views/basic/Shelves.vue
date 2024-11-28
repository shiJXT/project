<template>
  <div class="shelves-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>货架管理</span>
          <el-button type="primary" @click="handleAdd">新增货架</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="货架编号" width="120" />
        <el-table-column prop="area" label="区域" width="120" />
        <el-table-column prop="row" label="排" width="100" />
        <el-table-column prop="column" label="列" width="100" />
        <el-table-column prop="level" label="层" width="100" />
        <el-table-column prop="capacity" label="容量" width="120" />
        <el-table-column prop="used" label="已使用" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              删除
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
    id: 'SH001',
    area: 'A',
    row: '01',
    column: '01',
    level: '01',
    capacity: 100,
    used: 80,
    status: '正常'
  }
])

const handleAdd = () => {
  // 实现添加逻辑
}

const handleEdit = (row) => {
  // 实现编辑逻辑
}

const handleDelete = (row) => {
  // 实现删除逻辑
}
</script>

<style scoped>
.shelves-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 