<template>
  <div class="logs-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div class="header-operations">
            <el-button type="primary" @click="handleExport">导出日志</el-button>
            <el-button type="danger" @click="handleClear">清空日志</el-button>
          </div>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="登录" value="login" />
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 日志列表 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="timestamp" label="操作时间" width="180" />
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="module" label="操作模块" width="120" />
        <el-table-column prop="action" label="操作内容" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" link @click="handleDetail(scope.row)">
              详情
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

      <!-- 详情对话框 -->
      <el-dialog
        v-model="dialogVisible"
        title="日志详情"
        width="800px"
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作时间">{{ currentLog.timestamp }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ currentLog.type }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentLog.operator }}</el-descriptions-item>
          <el-descriptions-item label="操作模块">{{ currentLog.module }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentLog.status }}</el-descriptions-item>
          <el-descriptions-item label="操作内容" :span="2">{{ currentLog.action }}</el-descriptions-item>
          <el-descriptions-item label="请求参数" :span="2">
            <pre>{{ currentLog.params }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="响应结果" :span="2">
            <pre>{{ currentLog.response }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="错误信息" :span="2" v-if="currentLog.error">
            <pre class="error-message">{{ currentLog.error }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  dateRange: [],
  type: '',
  operator: ''
})

const tableData = ref([
  {
    timestamp: '2024-01-01 12:00:00',
    type: '登录',
    operator: '管理员',
    module: '系统',
    action: '用户登录',
    ip: '192.168.1.1',
    status: '成功',
    params: '{"username": "admin"}',
    response: '{"code": 200, "message": "success"}'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const dialogVisible = ref(false)
const currentLog = ref({})

const getTypeTag = (type) => {
  const types = {
    '登录': 'info',
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger'
  }
  return types[type] || 'info'
}

const handleSearch = () => {
  // 实现搜索逻辑
}

const resetForm = () => {
  searchForm.dateRange = []
  searchForm.type = ''
  searchForm.operator = ''
}

const handleExport = () => {
  // 实现导出逻辑
  ElMessage.success('日志导出已开始')
}

const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有日志吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现清空逻辑
    ElMessage.success('日志已清空')
  })
}

const handleDetail = (row) => {
  currentLog.value = row
  dialogVisible.value = true
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
.logs-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

pre {
  margin: 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-message {
  color: #f56c6c;
}
</style> 