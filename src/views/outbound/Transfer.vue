<template>
  <div class="transfer-outbound-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>调拨出库</span>
          <el-button type="primary" @click="handleCreateOrder">创建调拨出库单</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="调拨单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入调拨单号" clearable />
        </el-form-item>
        <el-form-item label="目标仓库">
          <el-select v-model="searchForm.targetWarehouse" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="待出库" value="pending" />
            <el-option label="部分出库" value="partial" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="orderNo" label="调拨单号" width="180" />
        <el-table-column prop="sourceWarehouse" label="源仓库" width="150" />
        <el-table-column prop="targetWarehouse" label="目标仓库" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === '待拣货'"
              @click="handlePicking(scope.row)"
            >
              拣货
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === '已拣货'"
              @click="handleConfirm(scope.row)"
            >
              确认出库
            </el-button>
            <el-button 
              type="danger" 
              link 
              v-if="scope.row.status === '待拣货'"
              @click="handleCancel(scope.row)"
            >
              取消
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

    <!-- 创建调拨出库单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建调拨出库单"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="目标仓库" prop="targetWarehouse">
          <el-select v-model="form.targetWarehouse" placeholder="请选择目标仓库">
            <el-option label="仓库A" value="warehouseA" />
            <el-option label="仓库B" value="warehouseB" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品列表">
          <el-button type="primary" link @click="handleAddProduct">
            添加商品
          </el-button>
          <el-table :data="form.products" border style="width: 100%; margin-top: 10px;">
            <el-table-column label="商品名称" width="180">
              <template #default="scope">
                <el-select v-model="scope.row.product" placeholder="请选择商品">
                  <el-option label="商品A" value="productA" />
                  <el-option label="商品B" value="productB" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="库位" width="150">
              <template #default="scope">
                <el-select v-model="scope.row.location" placeholder="请选择库位">
                  <el-option label="A-01-01" value="A-01-01" />
                  <el-option label="A-01-02" value="A-01-02" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="150">
              <template #default="scope">
                <el-input-number v-model="scope.row.quantity" :min="1" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="danger" link @click="handleRemoveProduct(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        
        <el-form-item label="调拨原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            rows="3"
            placeholder="请输入调拨原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const searchForm = reactive({
  orderNo: '',
  targetWarehouse: '',
  status: ''
})

const tableData = ref([
  {
    orderNo: 'TO202401010001',
    sourceWarehouse: '仓库A',
    targetWarehouse: '仓库B',
    createTime: '2024-01-01 10:00:00',
    status: '待拣货'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const dialogVisible = ref(false)

const form = reactive({
  targetWarehouse: '',
  products: [],
  reason: ''
})

const rules = {
  targetWarehouse: [
    { required: true, message: '请选择目标仓库', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入调拨原因', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const types = {
    '待拣货': 'warning',
    '已拣货': 'info',
    '已出库': 'success',
    '已取消': 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  // 实现搜索逻辑
}

const resetForm = () => {
  searchForm.orderNo = ''
  searchForm.targetWarehouse = ''
  searchForm.status = ''
}

const handleCreateOrder = () => {
  dialogVisible.value = true
  form.targetWarehouse = ''
  form.products = []
  form.reason = ''
}

const handleAddProduct = () => {
  form.products.push({
    product: '',
    location: '',
    quantity: 1
  })
}

const handleRemoveProduct = (index) => {
  form.products.splice(index, 1)
}

const handleSubmit = () => {
  // 实现提交逻辑
}

const handleView = (row) => {
  // 实现查看详情逻辑
}

const handlePicking = (row) => {
  // 实现拣货逻辑
}

const handleConfirm = (row) => {
  // 实现确认出库逻辑
}

const handleCancel = (row) => {
  // 实现取消逻辑
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
.transfer-outbound-container {
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