<template>
  <div class="purchase-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>采购入库</span>
          <el-button type="primary" @click="handleCreateOrder">创建采购入库单</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入入库单号" clearable />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="searchForm.supplier" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in supplierOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="待入库" value="pending" />
            <el-option label="部分入库" value="partial" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <el-table :data="props.row.products" border>
              <el-table-column prop="code" label="商品编码" width="120" />
              <el-table-column prop="name" label="商品名称" width="180" />
              <el-table-column prop="specification" label="规格" width="120" />
              <el-table-column prop="unit" label="单位" width="80" />
              <el-table-column prop="quantity" label="采购数量" width="100" />
              <el-table-column prop="receivedQuantity" label="已入库数量" width="100" />
              <el-table-column prop="price" label="单价" width="100">
                <template #default="scope">
                  ¥{{ scope.row.price.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">
                  ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="入库单号" width="180" />
        <el-table-column prop="purchaseNo" label="采购单号" width="180" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link
              :disabled="!['pending', 'partial'].includes(scope.row.status)"
              @click="handleInbound(scope.row)"
            >
              入库
            </el-button>
            <el-button type="success" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              type="warning" 
              link
              :disabled="scope.row.status !== 'pending'"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link
              :disabled="scope.row.status !== 'pending'"
              @click="handleCancel(scope.row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

      <!-- 入库单表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'create' ? '创建入库单' : '编辑入库单'"
        width="900px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购单号" prop="purchaseNo">
                <el-select 
                  v-model="form.purchaseNo"
                  placeholder="请选择采购单"
                  filterable
                  remote
                  :remote-method="handlePurchaseSearch"
                  :loading="purchaseLoading"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in purchaseOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商">
                <el-input v-model="form.supplier" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 商品列表 -->
          <el-table :data="form.products" border style="margin: 20px 0">
            <el-table-column prop="code" label="商品编码" width="120" />
            <el-table-column prop="name" label="商品名称" width="180" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="采购数量" width="100" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                ¥{{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>

          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              rows="3"
              placeholder="请输入备注信息"
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

      <!-- 入库操作对话框 -->
      <el-dialog
        v-model="inboundVisible"
        title="商品入库"
        width="900px"
      >
        <el-form
          ref="inboundFormRef"
          :model="inboundForm"
          :rules="inboundRules"
          label-width="100px"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="入库单号">{{ inboundForm.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="���购单号">{{ inboundForm.purchaseNo }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{ inboundForm.supplier }}</el-descriptions-item>
          </el-descriptions>

          <el-table 
            :data="inboundForm.products" 
            border 
            style="margin: 20px 0"
            :max-height="400"
          >
            <el-table-column prop="code" label="商品编码" width="120" />
            <el-table-column prop="name" label="商品名称" width="180" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="采购数量" width="100" />
            <el-table-column prop="receivedQuantity" label="已入库数量" width="100" />
            <el-table-column label="本次入库" width="150">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.inboundQuantity" 
                  :min="0" 
                  :max="scope.row.quantity - scope.row.receivedQuantity"
                  :precision="0"
                />
              </template>
            </el-table-column>
            <el-table-column label="货架号" width="150">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.shelfNo"
                  placeholder="请选择"
                  filterable
                >
                  <el-option
                    v-for="item in shelfOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="质检结果" width="120">
              <template #default="scope">
                <el-select v-model="scope.row.quality" placeholder="请选择">
                  <el-option label="合格" value="qualified" />
                  <el-option label="不合格" value="unqualified" />
                </el-select>
              </template>
            </el-table-column>
          </el-table>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="inboundForm.remark"
              type="textarea"
              rows="3"
              placeholder="请输入入库备注"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="inboundVisible = false">取消</el-button>
            <el-button type="primary" @click="handleInboundSubmit">
              确认入库
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="入库单详情"
        width="900px"
      >
        <el-descriptions :column="3" border>
          <el-descriptions-item label="入库单号">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="采购单号">{{ currentDetail.purchaseNo }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentDetail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总金额">
            ¥{{ currentDetail.totalAmount?.toFixed(2) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table 
          :data="currentDetail.products" 
          border 
          style="margin: 20px 0"
          :max-height="400"
        >
          <el-table-column prop="code" label="商品编码" width="120" />
          <el-table-column prop="name" label="商品名称" width="180" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="采购数量" width="100" />
          <el-table-column prop="receivedQuantity" label="已入库数量" width="100" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="scope">
              ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 入库记录 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>入库记录</h3>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in currentDetail.records"
              :key="index"
              :timestamp="record.time"
              :type="record.type"
            >
              {{ record.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  supplier: '',
  dateRange: [],
  status: ''
})

// 供应商选项
const supplierOptions = [
  { label: '供应商A', value: 'supplierA' },
  { label: '供应商B', value: 'supplierB' },
  { label: '供应商C', value: 'supplierC' }
]

// 货架选项
const shelfOptions = [
  { label: 'A-01-01', value: 'A-01-01' },
  { label: 'A-01-02', value: 'A-01-02' },
  { label: 'A-02-01', value: 'A-02-01' }
]

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    orderNo: 'IN202401010001',
    purchaseNo: 'PO202401010001',
    supplier: '供应商A',
    totalAmount: 10000.00,
    createTime: '2024-01-01 10:00:00',
    status: 'pending',
    remark: '春节备货',
    products: [
      {
        code: 'P001',
        name: '商品A',
        specification: '规格1',
        unit: '个',
        quantity: 100,
        receivedQuantity: 0,
        price: 50.00
      },
      {
        code: 'P002',
        name: '商品B',
        specification: '规格2',
        unit: '箱',
        quantity: 50,
        receivedQuantity: 0,
        price: 100.00
      }
    ]
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const inboundVisible = ref(false)
const detailVisible = ref(false)
const dialogType = ref('create')

// 采购单选择
const purchaseLoading = ref(false)
const purchaseOptions = ref([
  { label: 'PO202401010001', value: 'PO202401010001' },
  { label: 'PO202401010002', value: 'PO202401010002' }
])

// 表单
const formRef = ref(null)
const form = reactive({
  purchaseNo: '',
  supplier: '',
  products: [],
  remark: ''
})

// 入库表单
const inboundFormRef = ref(null)
const inboundForm = reactive({
  orderNo: '',
  purchaseNo: '',
  supplier: '',
  products: [],
  remark: ''
})

// 当前详情
const currentDetail = ref({
  orderNo: 'IN202401010001',
  purchaseNo: 'PO202401010001',
  supplier: '供应商A',
  totalAmount: 10000.00,
  createTime: '2024-01-01 10:00:00',
  status: 'partial',
  products: [
    {
      code: 'P001',
      name: '商品A',
      specification: '规格1',
      unit: '个',
      quantity: 100,
      receivedQuantity: 50,
      price: 50.00
    }
  ],
  records: [
    {
      time: '2024-01-01 10:00:00',
      type: 'primary',
      content: '创建入库单'
    },
    {
      time: '2024-01-01 14:00:00',
      type: 'success',
      content: '入库50个商品A，货架号A-01-01'
    }
  ]
})

// 表单校验规则
const rules = {
  purchaseNo: [
    { required: true, message: '请选择采购单', trigger: 'change' }
  ]
}

const inboundRules = {
  remark: [
    { required: true, message: '请输入入库备注', trigger: 'blur' }
  ]
}

// 状态相关方法
const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'partial': 'info',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待入库',
    'partial': '部分入库',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

// 方法
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
  searchForm.dateRange = []
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleCreateOrder = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  form.products = []
}

const handlePurchaseSearch = (query) => {
  purchaseLoading.value = true
  setTimeout(() => {
    purchaseLoading.value = false
    // 模拟远程搜索结果
    purchaseOptions.value = [
      { label: 'PO202401010001', value: 'PO202401010001' },
      { label: 'PO202401010002', value: 'PO202401010002' }
    ]
  }, 500)
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

const handleView = (row) => {
  detailVisible.value = true
  currentDetail.value = row
}

const handleInbound = (row) => {
  inboundVisible.value = true
  Object.assign(inboundForm, row)
  inboundForm.products = row.products.map(item => ({
    ...item,
    inboundQuantity: 0,
    shelfNo: '',
    quality: 'qualified'
  }))
}

const handleCancel = (row) => {
  ElMessageBox.confirm(
    '确定要取消该入库单吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('取消成功')
  })
}

const handleSubmit = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      dialogVisible.value = false
      ElMessage.success(dialogType.value === 'create' ? '创建成功' : '修改成功')
    }
  })
}

const handleInboundSubmit = () => {
  if (!inboundFormRef.value) return
  
  inboundFormRef.value.validate((valid) => {
    if (valid) {
      inboundVisible.value = false
      ElMessage.success('入库成功')
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
.purchase-container {
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

.detail-section {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}
</style> 