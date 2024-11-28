<template>
  <div class="picking-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>出库拣货</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="拣货单号">
          <el-input v-model="searchForm.pickingNo" placeholder="请输入拣货单号" clearable />
        </el-form-item>
        <el-form-item label="出库类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 180px">
            <el-option label="销售出库" value="sale" />
            <el-option label="调拨出库" value="transfer" />
          </el-select>
        </el-form-item>
        <el-form-item label="拣货状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="待拣货" value="pending" />
            <el-option label="拣货中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="拣货人">
          <el-select v-model="searchForm.picker" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in pickerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="orderNo" label="出库单号" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="assignee" label="拣货人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === '待拣货'"
              @click="handleStart(scope.row)"
            >
              开始拣货
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === '拣货中'"
              @click="handleComplete(scope.row)"
            >
              完成拣货
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 拣货详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="出库单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentOrder.type }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="拣货人">{{ currentOrder.assignee }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="currentOrder.products" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="name" label="商品名称" width="180" />
        <el-table-column prop="location" label="库位" width="120" />
        <el-table-column prop="quantity" label="数量" width="120" />
        <el-table-column label="拣货状态" width="120">
          <template #default="scope">
            <el-checkbox 
              v-model="scope.row.picked"
              :disabled="!isPickingStatus"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            v-if="isPickingStatus"
            @click="handleSavePicking"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const searchForm = reactive({
  orderNo: '',
  type: '',
  status: ''
})

const tableData = ref([
  {
    orderNo: 'OUT202401010001',
    type: '销售出库',
    createTime: '2024-01-01 10:00:00',
    assignee: '张三',
    status: '待拣货'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const dialogVisible = ref(false)
const currentOrder = reactive({
  orderNo: '',
  type: '',
  createTime: '',
  assignee: '',
  products: []
})

const dialogTitle = computed(() => {
  return isPickingStatus.value ? '拣货作业' : '拣货详情'
})

const isPickingStatus = computed(() => {
  return currentOrder.status === '拣货中'
})

const getStatusType = (status) => {
  const types = {
    '待拣货': 'warning',
    '拣货中': 'info',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  // 实现搜索逻辑
}

const resetForm = () => {
  searchForm.orderNo = ''
  searchForm.type = ''
  searchForm.status = ''
}

const handleView = (row) => {
  dialogVisible.value = true
  Object.assign(currentOrder, row)
  currentOrder.products = [
    {
      name: '商品A',
      location: 'A-01-01',
      quantity: 10,
      picked: false,
      remark: ''
    }
  ]
}

const handleStart = (row) => {
  dialogVisible.value = true
  Object.assign(currentOrder, row)
  currentOrder.status = '拣货中'
  currentOrder.products = [
    {
      name: '商品A',
      location: 'A-01-01',
      quantity: 10,
      picked: false,
      remark: ''
    }
  ]
}

const handleComplete = (row) => {
  // 实现完成拣货逻辑
}

const handleSavePicking = () => {
  // 实现保存拣货进度逻辑
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

<style scoped>
.picking-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 