<template>
  <div class="inventory-query-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存查询</span>
          <el-button type="success" @click="handleExport">导出数据</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品编码">
          <el-input v-model="searchForm.code" placeholder="请输入商品编码" clearable />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品类别">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 180px">
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装" value="clothing" />
            <el-option label="食品" value="food" />
            <el-option label="日用品" value="daily" />
          </el-select>
        </el-form-item>
        <el-form-item label="货架号">
          <el-select v-model="searchForm.shelfNo" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in shelfOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="正常" value="normal" />
            <el-option label="预警" value="warning" />
            <el-option label="超储" value="overflow" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="最近入库时间">{{ props.row.lastInboundTime }}</el-descriptions-item>
              <el-descriptions-item label="最近出库时间">{{ props.row.lastOutboundTime }}</el-descriptions-item>
              <el-descriptions-item label="最近盘点时间">{{ props.row.lastCheckTime }}</el-descriptions-item>
              <el-descriptions-item label="本月入库数量">{{ props.row.monthInbound }}</el-descriptions-item>
              <el-descriptions-item label="本月出库数量">{{ props.row.monthOutbound }}</el-descriptions-item>
              <el-descriptions-item label="库存周转率">{{ props.row.turnoverRate }}%</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="商品编码" width="120" />
        <el-table-column prop="name" label="商品名称" width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="specification" label="规格" width="120" show-overflow-tooltip />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="stock" label="当前库存" width="100" sortable>
          <template #default="scope">
            <span :class="getStockClass(scope.row)">{{ scope.row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="warningValue" label="预警值" width="100" />
        <el-table-column prop="shelfNo" label="货架号" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleHistory(scope.row)">
              库存记录
            </el-button>
            <el-button type="success" link @click="handleMove(scope.row)">
              库位调整
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

      <el-dialog
        v-model="historyVisible"
        title="库存记录"
        width="900px"
      >
        <el-descriptions :column="3" border>
          <el-descriptions-item label="商品编码">{{ currentProduct.code }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">{{ currentProduct.stock }}</el-descriptions-item>
        </el-descriptions>

        <el-table 
          :data="stockHistory" 
          border 
          style="margin: 20px 0"
          :max-height="400"
        >
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag :type="getOperationType(scope.row.type)">
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template #default="scope">
              <span :class="scope.row.type === '入库' ? 'text-success' : 'text-danger'">
                {{ scope.row.type === '入库' ? '+' : '-' }}{{ scope.row.quantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        </el-table>
      </el-dialog>

      <el-dialog
        v-model="moveVisible"
        title="库位调整"
        width="500px"
      >
        <el-form
          ref="moveFormRef"
          :model="moveForm"
          :rules="moveRules"
          label-width="100px"
        >
          <el-form-item label="当前货架号">
            <el-input v-model="moveForm.currentShelf" disabled />
          </el-form-item>
          <el-form-item label="目标货架号" prop="targetShelf">
            <el-select 
              v-model="moveForm.targetShelf"
              placeholder="请选择"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in shelfOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="调整原因" prop="reason">
            <el-input
              v-model="moveForm.reason"
              type="textarea"
              rows="3"
              placeholder="请输入调整原因"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="moveVisible = false">取消</el-button>
            <el-button type="primary" @click="handleMoveSubmit">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  code: '',
  name: '',
  category: '',
  shelfNo: '',
  status: ''
})

const shelfOptions = [
  { label: 'A-01-01', value: 'A-01-01' },
  { label: 'A-01-02', value: 'A-01-02' },
  { label: 'A-02-01', value: 'A-02-01' }
]

const loading = ref(false)
const tableData = ref([
  {
    code: 'P001',
    name: '示例商品1',
    category: '电子产品',
    specification: '规格1',
    unit: '个',
    stock: 100,
    warningValue: 20,
    shelfNo: 'A-01-01',
    status: 'normal',
    lastInboundTime: '2024-01-01 10:00:00',
    lastOutboundTime: '2024-01-01 14:00:00',
    lastCheckTime: '2024-01-01 16:00:00',
    monthInbound: 200,
    monthOutbound: 100,
    turnoverRate: 50
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const historyVisible = ref(false)
const currentProduct = ref({})
const stockHistory = ref([
  {
    time: '2024-01-01 10:00:00',
    type: '入库',
    quantity: 100,
    operator: '张三',
    remark: '采购入库'
  },
  {
    time: '2024-01-01 14:00:00',
    type: '出库',
    quantity: 50,
    operator: '李四',
    remark: '销售出库'
  }
])

const moveVisible = ref(false)
const moveFormRef = ref(null)
const moveForm = reactive({
  currentShelf: '',
  targetShelf: '',
  reason: ''
})

const moveRules = {
  targetShelf: [
    { required: true, message: '请选择目标货架', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
  ]
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const getStockClass = (row) => {
  if (row.stock <= row.warningValue) return 'text-danger'
  if (row.stock >= row.warningValue * 3) return 'text-warning'
  return 'text-success'
}

const getStatusType = (status) => {
  const types = {
    'normal': 'success',
    'warning': 'danger',
    'overflow': 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'warning': '预警',
    'overflow': '超储'
  }
  return texts[status] || status
}

const getOperationType = (type) => {
  const types = {
    '入库': 'success',
    '出库': 'danger'
  }
  return types[type] || 'info'
}

const handleHistory = (row) => {
  currentProduct.value = row
  historyVisible.value = true
}

const handleMove = (row) => {
  moveForm.currentShelf = row.shelfNo
  moveForm.targetShelf = ''
  moveForm.reason = ''
  moveVisible.value = true
}

const handleMoveSubmit = () => {
  if (!moveFormRef.value) return
  
  moveFormRef.value.validate((valid) => {
    if (valid) {
      moveVisible.value = false
      ElMessage.success('库位调整成功')
    }
  })
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
.inventory-query-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.text-success {
  color: #67C23A;
}

.text-warning {
  color: #E6A23C;
}

.text-danger {
  color: #F56C6C;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}
</style> 