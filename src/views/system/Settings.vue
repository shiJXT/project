<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicForm.systemName" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
              >
                <img v-if="basicForm.logo" :src="basicForm.logo" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="版权信息" prop="copyright">
              <el-input v-model="basicForm.copyright" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSubmit">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 业务参数设置 -->
        <el-tab-pane label="业务参数" name="business">
          <el-form
            ref="businessFormRef"
            :model="businessForm"
            :rules="businessRules"
            label-width="180px"
          >
            <el-form-item label="库存预警阈值(%)" prop="stockWarningThreshold">
              <el-input-number 
                v-model="businessForm.stockWarningThreshold"
                :min="1"
                :max="100"
              />
            </el-form-item>
            <el-form-item label="入库单自动审核" prop="autoApproveInbound">
              <el-switch v-model="businessForm.autoApproveInbound" />
            </el-form-item>
            <el-form-item label="出库单自动审核" prop="autoApproveOutbound">
              <el-switch v-model="businessForm.autoApproveOutbound" />
            </el-form-item>
            <el-form-item label="允许负库存" prop="allowNegativeStock">
              <el-switch v-model="businessForm.allowNegativeStock" />
            </el-form-item>
            <el-form-item label="库存盘点周期(天)" prop="inventoryCheckCycle">
              <el-input-number 
                v-model="businessForm.inventoryCheckCycle"
                :min="1"
                :max="365"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBusinessSubmit">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form
            ref="notificationFormRef"
            :model="notificationForm"
            :rules="notificationRules"
            label-width="120px"
          >
            <el-form-item label="邮件通知" prop="emailNotification">
              <el-switch v-model="notificationForm.emailNotification" />
            </el-form-item>
            <el-form-item 
              label="SMTP服务器" 
              prop="smtpServer"
              v-if="notificationForm.emailNotification"
            >
              <el-input v-model="notificationForm.smtpServer" />
            </el-form-item>
            <el-form-item 
              label="SMTP端口" 
              prop="smtpPort"
              v-if="notificationForm.emailNotification"
            >
              <el-input v-model="notificationForm.smtpPort" />
            </el-form-item>
            <el-form-item 
              label="发件邮箱" 
              prop="senderEmail"
              v-if="notificationForm.emailNotification"
            >
              <el-input v-model="notificationForm.senderEmail" />
            </el-form-item>
            <el-form-item 
              label="邮箱密码" 
              prop="emailPassword"
              v-if="notificationForm.emailNotification"
            >
              <el-input v-model="notificationForm.emailPassword" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleNotificationSubmit">保存设置</el-button>
              <el-button type="success" @click="handleTestEmail" v-if="notificationForm.emailNotification">
                测试邮件
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 备份设置 -->
        <el-tab-pane label="备份设置" name="backup">
          <el-form
            ref="backupFormRef"
            :model="backupForm"
            :rules="backupRules"
            label-width="120px"
          >
            <el-form-item label="自动备份" prop="autoBackup">
              <el-switch v-model="backupForm.autoBackup" />
            </el-form-item>
            <el-form-item 
              label="备份周期" 
              prop="backupCycle"
              v-if="backupForm.autoBackup"
            >
              <el-select v-model="backupForm.backupCycle">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
            <el-form-item 
              label="备份时间" 
              prop="backupTime"
              v-if="backupForm.autoBackup"
            >
              <el-time-picker v-model="backupForm.backupTime" format="HH:mm" />
            </el-form-item>
            <el-form-item 
              label="保留备份数" 
              prop="keepBackups"
              v-if="backupForm.autoBackup"
            >
              <el-input-number v-model="backupForm.keepBackups" :min="1" :max="100" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBackupSubmit">保存设置</el-button>
              <el-button type="success" @click="handleManualBackup">立即备份</el-button>
              <el-button type="warning" @click="handleRestore">恢复备份</el-button>
            </el-form-item>
          </el-form>

          <!-- 备份记录 -->
          <div class="backup-history">
            <h3>备份记录</h3>
            <el-table :data="backupHistory" border style="width: 100%">
              <el-table-column prop="filename" label="文件名" width="250" />
              <el-table-column prop="size" label="大小" width="120" />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" link @click="handleDownload(scope.row)">
                    下载
                  </el-button>
                  <el-button type="success" link @click="handleRestoreBackup(scope.row)">
                    恢复
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteBackup(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

// 基本设置
const basicForm = reactive({
  systemName: '商品库存管理系统',
  logo: '',
  copyright: '© 2024 XXX科技有限公司'
})

const basicRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' }
  ],
  copyright: [
    { required: true, message: '请输入版权信息', trigger: 'blur' }
  ]
}

// 业务参数设置
const businessForm = reactive({
  stockWarningThreshold: 20,
  autoApproveInbound: false,
  autoApproveOutbound: false,
  allowNegativeStock: false,
  inventoryCheckCycle: 30
})

const businessRules = {
  stockWarningThreshold: [
    { required: true, message: '请输入库存预警阈值', trigger: 'blur' }
  ],
  inventoryCheckCycle: [
    { required: true, message: '请输入库存盘点周期', trigger: 'blur' }
  ]
}

// 通知设置
const notificationForm = reactive({
  emailNotification: false,
  smtpServer: '',
  smtpPort: '',
  senderEmail: '',
  emailPassword: ''
})

const notificationRules = {
  smtpServer: [
    { required: true, message: '请输入SMTP服务器', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' }
  ],
  senderEmail: [
    { required: true, message: '请输入发件邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  emailPassword: [
    { required: true, message: '请输入邮箱密码', trigger: 'blur' }
  ]
}

// 备份设置
const backupForm = reactive({
  autoBackup: false,
  backupCycle: 'daily',
  backupTime: new Date(2024, 0, 1, 2, 0),
  keepBackups: 7
})

const backupRules = {
  backupCycle: [
    { required: true, message: '请选择备份周期', trigger: 'change' }
  ],
  backupTime: [
    { required: true, message: '请选择备份时间', trigger: 'change' }
  ],
  keepBackups: [
    { required: true, message: '请输入保留备份数', trigger: 'blur' }
  ]
}

// 备份记录
const backupHistory = ref([
  {
    filename: 'backup_20240101_020000.sql',
    size: '1.2MB',
    createTime: '2024-01-01 02:00:00'
  }
])

// 处理方法
const handleLogoSuccess = (response) => {
  basicForm.logo = response.url
  ElMessage.success('Logo上传成功')
}

const handleBasicSubmit = () => {
  // 实现基本设置保存逻辑
  ElMessage.success('基本设置保存成功')
}

const handleBusinessSubmit = () => {
  // 实现业务参数保存逻辑
  ElMessage.success('业务参数保存成功')
}

const handleNotificationSubmit = () => {
  // 实现通知设置保存逻辑
  ElMessage.success('通知设置保存成功')
}

const handleTestEmail = () => {
  // 实现测试邮件发送逻辑
  ElMessage.success('测试邮件发送成功')
}

const handleBackupSubmit = () => {
  // 实现备份设置保存逻辑
  ElMessage.success('备份设置保存成功')
}

const handleManualBackup = () => {
  // 实现手动备份逻辑
  ElMessage.success('系统备份已启动')
}

const handleRestore = () => {
  // 实现恢复备份逻辑
  ElMessage.warning('请选择要恢复的备份文件')
}

const handleDownload = (row) => {
  // 实现备份下载逻辑
  ElMessage.success('备份文件下载已开始')
}

const handleRestoreBackup = (row) => {
  // 实现恢复指定备份逻辑
  ElMessage.success('系统恢复已启动')
}

const handleDeleteBackup = (row) => {
  // 实现删除备份逻辑
  ElMessage.success('备份文件已删除')
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
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

.backup-history {
  margin-top: 20px;
}
</style> 