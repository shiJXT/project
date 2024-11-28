<template>
  <div class="inventory-warning-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存预警</span>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="商品编号" width="120" />
        <el-table-column prop="name" label="商品名称" width="180" />
        <el-table-column prop="quantity" label="当前库存" width="120" />
        <el-table-column prop="minQuantity" label="最低库存" width="120" />
        <el-table-column prop="maxQuantity" label="最高库存" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === '低库存' ? 'danger' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" link @click="handlePurchase(scope.row)">
              采购
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
    id: 'P001',
    name: '示例商品1',
    quantity: 10,
    minQuantity: 20,
    maxQuantity: 100,
    status: '低库存'
  }
])

const handlePurchase = (row) => {
  // 实现采购逻辑
}
</script>

<style scoped>
.inventory-warning-container {
  padding: 20px;
}
</style> 