<template>
  <div class="receipt-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>到货管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="采购单号">
          <el-input v-model="searchForm.purchaseNo" placeholder="请输入采购单号" clearable />
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="待收货" value="pending" />
            <el-option label="部分收货" value="partial" />
            <el-option label="已完成" value="completed" />
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
            <el-table :data="props.row.products" border>
              <el-table-column prop="code" label="商品编码" width="120" />
              <el-table-column prop="name" label="商品名称" width="180" />
              <el-table-column prop="specification" label="规格" width="120" />
              <el-table-column prop="unit" label="单位" width="80" />
              <el-table-column prop="expectedQuantity" label="预期数量" width="100" />
              <el-table-column prop="receivedQuantity" label="已收数量" width="100" />
              <el-table-column prop="qualifiedQuantity" label="合格数量" width="100" />
              <el-table-column prop="unqualifiedQuantity" label="不合格数量" width="100" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseNo" label="采购单号" width="180" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="expectedTime" label="预计到货" width="120" />
        <el-table-column prop="actualTime" label="实际到货" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link
              :disabled="scope.row.status === 'completed'"
              @click="handleReceive(scope.row)"
            >
              收货
            </el-button>
            <el-button type="success" link @click="handleView(scope.row)">
              查看
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
        v-model="dialogVisible"
        title="商品收货"
        width="900px"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="采购单号">{{ form.purchaseNo }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{ form.supplier }}</el-descriptions-item>
            <el-descriptions-item label="预计到货">{{ form.expectedTime }}</el-descriptions-item>
          </el-descriptions>

          <el-table 
            :data="form.products" 
            border 
            style="margin: 20px 0"
            :max-height="400"
          >
            <el-table-column prop="code" label="商品编码" width="120" />
            <el-table-column prop="name" label="商品名称" width="180" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="expectedQuantity" label="预期数量" width="100" />
            <el-table-column prop="receivedQuantity" label="已收数量" width="100" />
            <el-table-column label="本次收货" width="150">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.quantity" 
                  :min="0" 
                  :max="scope.row.expectedQuantity - scope.row.receivedQuantity"
                  :precision="0"
                />
              </template>
            </el-table-column>
            <el-table-column label="质检结果" width="150">
              <template #default="scope">
                <el-select v-model="scope.row.quality" placeholder="请选择">
                  <el-option label="合格" value="qualified" />
                  <el-option label="不合格" value="unqualified" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="货架号" width="150">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.shelfNo"
                  placeholder="请选择"
                  filterable
                  :disabled="scope.row.quality === 'unqualified'"
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

          <el-form-item label="质检说明" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              rows="3"
              placeholder="请输入质检说明"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">
              确认收货
            </el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog
        v-model="detailVisible"
        title="收货详情"
        width="900px"
      >
        <el-descriptions :column="3" border>
          <el-descriptions-item label="采购单号">{{ currentDetail.purchaseNo }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentDetail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="预计到货">{{ currentDetail.expectedTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetail.status)">
              {{ currentDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="实际到货">{{ currentDetail.actualTime }}</el-descriptions-item>
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
          <el-table-column prop="expectedQuantity" label="预期数量" width="100" />
          <el-table-column prop="receivedQuantity" label="已收数量" width="100" />
          <el-table-column prop="qualifiedQuantity" label="合格数量" width="100" />
          <el-table-column prop="unqualifiedQuantity" label="不合格数量" width="100" />
          <el-table-column prop="shelfNo" label="货架号" width="120" />
        </el-table>

        <div class="detail-section">
          <div class="section-header">
            <h3>收货记录</h3>
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

const searchForm = reactive({
  purchaseNo: '',
  supplier: '',
  status: ''
})

const supplierOptions = [
  { label: '供应商A', value: 'supplierA' },
  { label: '供应商B', value: 'supplierB' },
  { label: '供应商C', value: 'supplierC' }
]

const shelfOptions = [
  { label: 'A-01-01', value: 'A-01-01' },
  { label: 'A-01-02', value: 'A-01-02' },
  { label: 'A-02-01', value: 'A-02-01' }
]

const loading = ref(false)
const tableData = ref([
  {
    purchaseNo: 'PO202401010001',
    supplier: '供应商A',
    expectedTime: '2024-01-01',
    actualTime: '2024-01-01 14:00:00',
    status: '部分收货',
    remark: '春节备货',
    products: [
      {
        code: 'P001',
        name: '商品A',
        specification: '规格1',
        unit: '个',
        expectedQuantity: 100,
        receivedQuantity: 50,
        qualifiedQuantity: 45,
        unqualifiedQuantity: 5
      },
      {
        code: 'P002',
        name: '商品B',
        specification: '规格2',
        unit: '箱',
        expectedQuantity: 50,
        receivedQuantity: 0,
        qualifiedQuantity: 0,
        unqualifiedQuantity: 0
      }
    ]
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const dialogVisible = ref(false)
const detailVisible = ref(false)

const formRef = ref(null)
const form = reactive({
  purchaseNo: '',
  supplier: '',
  expectedTime: '',
  products: [],
  remark: ''
})

const currentDetail = ref({
  purchaseNo: 'PO202401010001',
  supplier: '供应商A',
  expectedTime: '2024-01-01',
  actualTime: '2024-01-01 14:00:00',
  status: '部分收货',
  remark: '春节备货',
  products: [
    {
      code: 'P001',
      name: '商品A',
      specification: '规格1',
      unit: '个',
      expectedQuantity: 100,
      receivedQuantity: 50,
      qualifiedQuantity: 45,
      unqualifiedQuantity: 5,
      shelfNo: 'A-01-01'
    }
  ],
  records: [
    {
      time: '2024-01-01 14:00:00',
      type: 'success',
      content: '收货50个商品A，合格45个，不合格5个'
    }
  ]
})

const rules = {
  remark: [
    { required: true, message: '请输入质检说明', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const types = {
    '待收货': 'warning',
    '部分收货': 'info',
    '已完成': 'success'
  }
  return types[status] || 'info'
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

const handleView = (row) => {
  detailVisible.value = true
  currentDetail.value = row
}

const handleReceive = (row) => {
  dialogVisible.value = true
  Object.assign(form, row)
  form.products = row.products.map(item => ({
    ...item,
    quantity: 0,
    quality: 'qualified',
    shelfNo: ''
  }))
}

const handleSubmit = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      dialogVisible.value = false
      ElMessage.success('收货成功')
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
.receipt-container {
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