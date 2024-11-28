<template>
  <div class="products-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">新增商品</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="商品编码" width="120" />
        <el-table-column prop="name" label="商品名称" width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="specification" label="规格" width="120" show-overflow-tooltip />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" sortable />
        <el-table-column prop="warningValue" label="预警值" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="success" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              link 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
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

      <!-- 商品表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
        width="700px"
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
              <el-form-item label="商品编码" prop="code">
                <el-input v-model="form.code" :disabled="dialogType === 'edit'" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="form.name" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品类别" prop="category">
                <el-select v-model="form.category" style="width: 100%">
                  <el-option label="电子产品" value="electronics" />
                  <el-option label="服装" value="clothing" />
                  <el-option label="食品" value="food" />
                  <el-option label="日用品" value="daily" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位" prop="unit">
                <el-input v-model="form.unit" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="规格" prop="specification">
                <el-input v-model="form.specification" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单价" prop="price">
                <el-input-number 
                  v-model="form.price"
                  :precision="2"
                  :step="0.1"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预警值" prop="warningValue">
                <el-input-number 
                  v-model="form.warningValue"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-switch
                  v-model="form.status"
                  :active-value="'active'"
                  :inactive-value="'inactive'"
                  active-text="启用"
                  inactive-text="停用"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="商品图片">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleImageSuccess"
            >
              <img v-if="form.image" :src="form.image" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="商品描述">
            <el-input
              v-model="form.description"
              type="textarea"
              rows="3"
              placeholder="请输入商品描述"
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

      <!-- 商品详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="商品详情"
        width="800px"
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品编码">{{ currentProduct.code }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
          <el-descriptions-item label="商品类别">{{ currentProduct.category }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ currentProduct.unit }}</el-descriptions-item>
          <el-descriptions-item label="规格">{{ currentProduct.specification }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ currentProduct.price?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">{{ currentProduct.stock }}</el-descriptions-item>
          <el-descriptions-item label="预警值">{{ currentProduct.warningValue }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentProduct.status === 'active' ? 'success' : 'info'">
              {{ currentProduct.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentProduct.createTime }}</el-descriptions-item>
          <el-descriptions-item label="商品图片" :span="2">
            <img v-if="currentProduct.image" :src="currentProduct.image" class="detail-image" />
            <el-empty v-else description="暂无图片" />
          </el-descriptions-item>
          <el-descriptions-item label="商品描述" :span="2">
            {{ currentProduct.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  category: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    code: 'P001',
    name: '示例商品1',
    category: '电子产品',
    specification: '规格1',
    unit: '个',
    price: 99.99,
    stock: 100,
    warningValue: 20,
    status: 'active',
    createTime: '2024-01-01 12:00:00',
    description: '这是一个示例商品'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogType = ref('add')
const currentProduct = ref({})

// 表单
const formRef = ref(null)
const form = reactive({
  code: '',
  name: '',
  category: '',
  specification: '',
  unit: '',
  price: 0,
  warningValue: 0,
  status: 'active',
  image: '',
  description: ''
})

// 表单校验规则
const rules = {
  code: [
    { required: true, message: '请输入商品编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9]{4,10}$/, message: '编码格式不正确', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品类别', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入单价', trigger: 'blur' }
  ],
  warningValue: [
    { required: true, message: '请输入预警值', trigger: 'blur' }
  ]
}

// 方法
const handleSearch = () => {
  // 实现搜索逻辑
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  form.status = 'active'
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

const handleView = (row) => {
  currentProduct.value = row
  detailVisible.value = true
}

const handleToggleStatus = (row) => {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}该商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现状态切换逻辑
    ElMessage.success(`${action}成功`)
  })
}

const handleImageSuccess = (response) => {
  form.image = response.url
  ElMessage.success('图片上传成功')
}

const handleSubmit = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      // 实现提交逻辑
      dialogVisible.value = false
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
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
.products-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.detail-image {
  max-width: 300px;
  max-height: 300px;
  object-fit: contain;
}
</style> 