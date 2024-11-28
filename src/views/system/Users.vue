<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户权限管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="success" link @click="handlePermission(scope.row)">
              权限设置
            </el-button>
            <el-button type="warning" link @click="handleResetPwd(scope.row)">
              重置密码
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 用户表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
        width="600px"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" :disabled="dialogType === 'edit'" />
          </el-form-item>
          <el-form-item label="姓名" prop="realName">
            <el-input v-model="form.realName" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色">
              <el-option label="系统管理员" value="admin" />
              <el-option label="库管主管" value="manager" />
              <el-option label="入库员" value="inbound" />
              <el-option label="出库员" value="outbound" />
              <el-option label="质检员" value="inspector" />
            </el-select>
          </el-form-item>
          <el-form-item label="部门" prop="department">
            <el-select v-model="form.department" placeholder="请选择部门">
              <el-option label="仓储部" value="warehouse" />
              <el-option label="质检部" value="quality" />
              <el-option label="采购部" value="purchase" />
            </el-select>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="form.phone" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
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

      <!-- 权限设置对话框 -->
      <el-dialog
        v-model="permissionDialogVisible"
        title="权限设置"
        width="600px"
      >
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          :props="{
            children: 'children',
            label: 'name'
          }"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="permissionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handlePermissionSubmit">
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
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([
  {
    username: 'admin',
    realName: '系统管理员',
    role: '系统管理员',
    department: '仓储部',
    email: 'admin@example.com',
    phone: '13800138000',
    status: 1
  }
])

const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogType = ref('add')
const currentUserId = ref('')

const form = reactive({
  username: '',
  realName: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  status: 1
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 权限树数据
const permissionTree = ref([
  {
    id: 1,
    name: '基础数据管理',
    children: [
      { id: 11, name: '供应商管理' },
      { id: 12, name: '员工管理' },
      { id: 13, name: '商品管理' },
      { id: 14, name: '货架管理' }
    ]
  },
  {
    id: 2,
    name: '入库管理',
    children: [
      { id: 21, name: '采购入库' },
      { id: 22, name: '调拨入库' },
      { id: 23, name: '到货管理' }
    ]
  },
  {
    id: 3,
    name: '出库管理',
    children: [
      { id: 31, name: '销售出库' },
      { id: 32, name: '调拨出库' },
      { id: 33, name: '出库拣货' }
    ]
  },
  {
    id: 4,
    name: '库存管理',
    children: [
      { id: 41, name: '库存查询' },
      { id: 42, name: '库存预警' },
      { id: 43, name: '库存盘点' }
    ]
  }
])

const checkedPermissions = ref([])

const getRoleType = (role) => {
  const types = {
    '系统管理员': 'danger',
    '库管主管': 'warning',
    '入库员': 'success',
    '出库员': 'success',
    '质检员': 'info'
  }
  return types[role] || 'info'
}

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  form.status = 1
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

const handlePermission = (row) => {
  currentUserId.value = row.username
  permissionDialogVisible.value = true
  // 模拟获取用户权限
  checkedPermissions.value = [11, 12, 21, 22]
}

const handleResetPwd = (row) => {
  ElMessageBox.confirm(
    '确定要重置该用户的密码吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现重置密码逻辑
    ElMessage.success('密码重置成功')
  })
}

const handleStatusChange = (row) => {
  // 实现状态更改逻辑
  ElMessage.success(`用户状态已${row.status === 1 ? '启用' : '禁用'}`)
}

const handleSubmit = () => {
  // 实现表单提交逻辑
  dialogVisible.value = false
  ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
}

const handlePermissionSubmit = () => {
  // 实现权限保存逻辑
  permissionDialogVisible.value = false
  ElMessage.success('权限设置成功')
}
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 