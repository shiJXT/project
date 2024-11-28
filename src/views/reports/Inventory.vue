<template>
  <div class="inventory-report-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存报表</span>
          <div class="header-operations">
            <el-button type="primary" @click="handleExport">导出报表</el-button>
            <el-button type="success" @click="handlePrint">打印报表</el-button>
          </div>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="商品类别">
          <el-select v-model="searchForm.category" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装" value="clothing" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouse" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="仓库A" value="warehouseA" />
            <el-option label="仓库B" value="warehouseB" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 报表内容 -->
      <div class="report-content">
        <h2>库存状况报表</h2>
        <p class="report-info">
          统计时间：{{ reportInfo.startDate }} 至 {{ reportInfo.endDate }}
        </p>
        <p class="report-info">生成时间：{{ reportInfo.generateTime }}</p>

        <!-- 汇总信息 -->
        <el-descriptions title="汇总信息" :column="4" border>
          <el-descriptions-item label="商品总数">{{ summary.totalProducts }}</el-descriptions-item>
          <el-descriptions-item label="库存总量">{{ summary.totalQuantity }}</el-descriptions-item>
          <el-descriptions-item label="库存总值">{{ summary.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="预警商品数">{{ summary.warningCount }}</el-descriptions-item>
        </el-descriptions>

        <!-- 详细数据 -->
        <el-table :data="tableData" border style="width: 100%; margin-top: 20px;">
          <el-table-column prop="category" label="商品类别" width="150" />
          <el-table-column prop="code" label="商品编码" width="150" />
          <el-table-column prop="name" label="商品名称" width="180" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="库存数量" width="120" />
          <el-table-column prop="price" label="单价" width="120" />
          <el-table-column prop="amount" label="金额" width="120" />
          <el-table-column prop="warehouse" label="所在仓库" width="120" />
          <el-table-column prop="location" label="库位" width="120" />
          <el-table-column prop="warningValue" label="预警值" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
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
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const searchForm = reactive({
  dateRange: [],
  category: '',
  warehouse: ''
})

const reportInfo = reactive({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  generateTime: '2024-01-31 12:00:00'
})

const summary = reactive({
  totalProducts: 1000,
  totalQuantity: 10000,
  totalAmount: 1000000,
  warningCount: 5
})

const tableData = ref([
  {
    category: '电子产品',
    code: 'P001',
    name: '示例商品1',
    specification: '规格1',
    unit: '个',
    quantity: 100,
    price: 1000,
    amount: 100000,
    warehouse: '仓库A',
    location: 'A-01-01',
    warningValue: 20,
    status: '正常'
  }
  // 更多数据...
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const getStatusType = (status) => {
  const types = {
    '正常': 'success',
    '预警': 'warning',
    '缺货': 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  // 实现搜索逻辑
}

const resetForm = () => {
  searchForm.dateRange = []
  searchForm.category = ''
  searchForm.warehouse = ''
}

const handleExport = () => {
  // 实现导出逻辑
}

const handlePrint = () => {
  // 实现打印逻辑
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
.inventory-report-container {
  padding: 20px;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.report-content {
  margin-top: 20px;
}

.report-info {
  color: #666;
  margin: 10px 0;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 