<template>
  <div class="transfer-inbound-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>调拨入库</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="调拨单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入调拨单号" clearable />
        </el-form-item>
        <el-form-item label="来源仓库">
          <el-select v-model="searchForm.sourceWarehouse" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨时间">
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
              <el-table-column prop="quantity" label="调拨数量" width="100" />
              <el-table-column prop="receivedQuantity" label="已入库数量" width="100" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="调拨单号" width="180" />
        <el-table-column prop="sourceWarehouse" label="来源仓库" width="150" />
        <el-table-column prop="targetWarehouse" label="目标仓库" width="150" />
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

      <!-- 入库操作对话框 -->
      <el-dialog
        v-model="inboundVisible"
        title="调拨入库"
        width="900px"
      >
        <el-form
          ref="inboundFormRef"
          :model="inboundForm"
          :rules="inboundRules"
          label-width="100px"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="调拨单号">{{ inboundForm.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="来源仓库">{{ inboundForm.sourceWarehouse }}</el-descriptions-item>
            <el-descriptions-item label="目标仓库">{{ inboundForm.targetWarehouse }}</el-descriptions-item>
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
            <el-table-column prop="quantity" label="调拨数量" width="100" />
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
        title="调拨单详情"
        width="900px"
      >
        <el-descriptions :column="3" border>
          <el-descriptions-item label="调拨单号">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="来源仓库">{{ currentDetail.sourceWarehouse }}</el-descriptions-item>
          <el-descriptions-item label="目标仓库">{{ currentDetail.targetWarehouse }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentDetail.remark }}</el-descriptions-item>
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
          <el-table-column prop="quantity" label="调拨数量" width="100" />
          <el-table-column prop="receivedQuantity" label="已入库数量" width="100" />
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
  sourceWarehouse: '',
  dateRange: [],
  status: ''
})

// 仓库选项
const warehouseOptions = [
  { label: '北京仓库', value: 'BJ01' },
  { label: '上海仓库', value: 'SH01' },
  { label: '广州仓库', value: 'GZ01' }
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
    orderNo: 'TR202401010001',
    sourceWarehouse: '北京仓库',
    targetWarehouse: '上海仓库',
    createTime: '2024-01-01 10:00:00',
    status: 'pending',
    remark: '春节调货',
    products: [
      {
        code: 'P001',
        name: '商品A',
        specification: '规格1',
        unit: '个',
        quantity: 100,
        receivedQuantity: 0
      },
      {
        code: 'P002',
        name: '商品B',
        specification: '规格2',
        unit: '箱',
        quantity: 50,
        receivedQuantity: 0
      }
    ]
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const inboundVisible = ref(false)
const detailVisible = ref(false)

// 入库表单
const inboundFormRef = ref(null)
const inboundForm = reactive({
  orderNo: '',
  sourceWarehouse: '',
  targetWarehouse: '',
  products: [],
  remark: ''
})

// 当前详情
const currentDetail = ref({
  orderNo: 'TR202401010001',
  sourceWarehouse: '北京仓库',
  targetWarehouse: '上海仓库',
  createTime: '2024-01-01 10:00:00',
  status: 'partial',
  remark: '春节调货',
  products: [
    {
      code: 'P001',
      name: '商品A',
      specification: '规格1',
      unit: '个',
      quantity: 100,
      receivedQuantity: 50
    }
  ],
  records: [
    {
      time: '2024-01-01 10:00:00',
      type: 'primary',
      content: '创建调拨单'
    },
    {
      time: '2024-01-01 14:00:00',
      type: 'success',
      content: '入库50个商品A，货架号A-01-01'
    }
  ]
})

// 表单校验规则
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
    '确定要取消该调拨单吗？',
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
.transfer-inbound-container {
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