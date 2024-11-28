<template>
  <div class="sale-outbound-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>销售出库</span>
          <el-button type="primary" @click="handleCreateOrder">创建出库单</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入出库单号" clearable />
        </el-form-item>
        <el-form-item label="销售单号">
          <el-input v-model="searchForm.saleNo" placeholder="请输入销售单号" clearable />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="searchForm.customer" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in customerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库时间">
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
            <el-option label="待出库" value="pending" />
            <el-option label="部分出库" value="partial" />
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
              <el-table-column prop="quantity" label="销售数量" width="100" />
              <el-table-column prop="outboundQuantity" label="已出库数量" width="100" />
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
        <el-table-column prop="orderNo" label="出库单号" width="180" />
        <el-table-column prop="saleNo" label="销售单号" width="180" />
        <el-table-column prop="customer" label="客户" width="150" />
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
              @click="handleOutbound(scope.row)"
            >
              出库
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

      <!-- 出库单表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'create' ? '创建出库单' : '编辑出库单'"
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
              <el-form-item label="销售单号" prop="saleNo">
                <el-select 
                  v-model="form.saleNo"
                  placeholder="请选择销售单"
                  filterable
                  remote
                  :remote-method="handleSaleSearch"
                  :loading="saleLoading"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in saleOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客户">
                <el-input v-model="form.customer" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 商品列表 -->
          <el-table :data="form.products" border style="margin: 20px 0">
            <el-table-column prop="code" label="商品编码" width="120" />
            <el-table-column prop="name" label="商品名称" width="180" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="销售数量" width="100" />
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

      <!-- 出库操作对话框 -->
      <el-dialog
        v-model="outboundVisible"
        title="商品出库"
        width="900px"
      >
        <el-form
          ref="outboundFormRef"
          :model="outboundForm"
          :rules="outboundRules"
          label-width="100px"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="出库单号">{{ outboundForm.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="销售单号">{{ outboundForm.saleNo }}</el-descriptions-item>
            <el-descriptions-item label="客户">{{ outboundForm.customer }}</el-descriptions-item>
          </el-descriptions>

          <el-table 
            :data="outboundForm.products" 
            border 
            style="margin: 20px 0"
            :max-height="400"
          >
            <el-table-column prop="code" label="商品编码" width="120" />
            <el-table-column prop="name" label="商品名称" width="180" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="销售数量" width="100" />
            <el-table-column prop="outboundQuantity" label="已出库数量" width="100" />
            <el-table-column label="本次出库" width="150">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.currentQuantity" 
                  :min="0" 
                  :max="scope.row.quantity - scope.row.outboundQuantity"
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
          </el-table>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="outboundForm.remark"
              type="textarea"
              rows="3"
              placeholder="请输入出库备注"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="outboundVisible = false">取消</el-button>
            <el-button type="primary" @click="handleOutboundSubmit">
              确认出库
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="出库单详情"
        width="900px"
      >
        <el-descriptions :column="3" border>
          <el-descriptions-item label="出库单号">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="销售单号">{{ currentDetail.saleNo }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ currentDetail.customer }}</el-descriptions-item>
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
          <el-table-column prop="quantity" label="销售数量" width="100" />
          <el-table-column prop="outboundQuantity" label="已出库数量" width="100" />
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

        <!-- 出库记录 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>出库记录</h3>
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
  saleNo: '',
  customer: '',
  dateRange: [],
  status: ''
})

// 客户选项
const customerOptions = [
  { label: '客户A', value: 'customerA' },
  { label: '客户B', value: 'customerB' },
  { label: '客户C', value: 'customerC' }
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
    orderNo: 'SO202401010001',
    saleNo: 'SA202401010001',
    customer: '客户A',
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
        outboundQuantity: 0,
        price: 50.00
      },
      {
        code: 'P002',
        name: '商品B',
        specification: '规格2',
        unit: '箱',
        quantity: 50,
        outboundQuantity: 0,
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
const outboundVisible = ref(false)
const detailVisible = ref(false)
const dialogType = ref('create')

// 销售单选择
const saleLoading = ref(false)
const saleOptions = ref([
  { label: 'SA202401010001', value: 'SA202401010001' },
  { label: 'SA202401010002', value: 'SA202401010002' }
])

// 表单
const formRef = ref(null)
const form = reactive({
  saleNo: '',
  customer: '',
  products: [],
  remark: ''
})

// 出库表单
const outboundFormRef = ref(null)
const outboundForm = reactive({
  orderNo: '',
  saleNo: '',
  customer: '',
  products: [],
  remark: ''
})

// 当前详情
const currentDetail = ref({
  orderNo: 'SO202401010001',
  saleNo: 'SA202401010001',
  customer: '客户A',
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
      outboundQuantity: 50,
      price: 50.00
    }
  ],
  records: [
    {
      time: '2024-01-01 10:00:00',
      type: 'primary',
      content: '创建出库单'
    },
    {
      time: '2024-01-01 14:00:00',
      type: 'success',
      content: '出库50个商品A，货架号A-01-01'
    }
  ]
})

// 表单校验规则
const rules = {
  saleNo: [
    { required: true, message: '请选择销售单', trigger: 'change' }
  ]
}

const outboundRules = {
  remark: [
    { required: true, message: '请输入出库备注', trigger: 'blur' }
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
    'pending': '待出库',
    'partial': '部分出库',
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

const handleSaleSearch = (query) => {
  saleLoading.value = true
  setTimeout(() => {
    saleLoading.value = false
    // 模拟远程搜索结果
    saleOptions.value = [
      { label: 'SA202401010001', value: 'SA202401010001' },
      { label: 'SA202401010002', value: 'SA202401010002' }
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

const handleOutbound = (row) => {
  outboundVisible.value = true
  Object.assign(outboundForm, row)
  outboundForm.products = row.products.map(item => ({
    ...item,
    currentQuantity: 0,
    shelfNo: ''
  }))
}

const handleCancel = (row) => {
  ElMessageBox.confirm(
    '确定要取消该出库单吗？',
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

const handleOutboundSubmit = () => {
  if (!outboundFormRef.value) return
  
  outboundFormRef.value.validate((valid) => {
    if (valid) {
      outboundVisible.value = false
      ElMessage.success('出库成功')
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
.sale-outbound-container {
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