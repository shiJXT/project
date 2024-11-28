<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statisticsCards" :key="card.title">
        <el-card class="statistics-card" :body-style="{ padding: '20px' }">
          <div class="card-content">
            <div class="card-icon" :style="{ background: card.bgColor }">
              <el-icon>
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-trend" :class="card.trend > 0 ? 'up' : 'down'">
                <el-icon>
                  <component :is="card.trend > 0 ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
                {{ Math.abs(card.trend) }}% 较上月
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>销售趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>库存分布</span>
              <el-tooltip content="刷新数据" placement="top">
                <el-icon class="refresh-icon" @click="refreshData"><Refresh /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="stockChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项和预警信息 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(todo, index) in todoList"
              :key="index"
              :type="todo.type"
              :timestamp="todo.time"
              :color="todo.color"
            >
              {{ todo.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="warning-card">
          <template #header>
            <div class="card-header">
              <span>预警信息</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="warningList" style="width: 100%">
            <el-table-column prop="product" label="商品" width="180" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getWarningType(scope.row.type)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Box, ShoppingCart, Money, TrendCharts } from '@element-plus/icons-vue'

// 统计卡片数据
const statisticsCards = [
  {
    title: '商品总数',
    value: '1,234',
    icon: Box,
    bgColor: '#409EFF',
    trend: 12.5
  },
  {
    title: '本月销售额',
    value: '¥123,456',
    icon: Money,
    bgColor: '#67C23A',
    trend: 8.2
  },
  {
    title: '本月订单数',
    value: '856',
    icon: ShoppingCart,
    bgColor: '#E6A23C',
    trend: -3.5
  },
  {
    title: '库存预警',
    value: '12',
    icon: TrendCharts,
    bgColor: '#F56C6C',
    trend: 5.3
  }
]

// 时间范围选择
const timeRange = ref('month')

// 图表实例
const salesChartRef = ref(null)
const stockChartRef = ref(null)

// 待办事项
const todoList = [
  {
    content: '采购订单待审核',
    time: '10:00',
    type: 'primary',
    color: '#409EFF'
  },
  {
    content: '库存盘点待处理',
    time: '11:30',
    type: 'warning',
    color: '#E6A23C'
  },
  {
    content: '出库单待确认',
    time: '14:00',
    type: 'success',
    color: '#67C23A'
  },
  {
    content: '系统维护通知',
    time: '16:00',
    type: 'info',
    color: '#909399'
  }
]

// 预警信息
const warningList = [
  {
    product: '商品A',
    type: '库存不足',
    time: '2024-01-01 10:00:00'
  },
  {
    product: '商品B',
    type: '即将过期',
    time: '2024-01-01 11:00:00'
  },
  {
    product: '商品C',
    type: '积压过多',
    time: '2024-01-01 12:00:00'
  }
]

// 初始化销售趋势图表
const initSalesChart = () => {
  const chart = echarts.init(salesChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '订单数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单数',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: [10000, 12000, 15000, 13000, 16000, 20000, 18000],
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.3)' },
            { offset: 1, color: 'rgba(64,158,255,0.1)' }
          ])
        }
      },
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [100, 120, 150, 130, 160, 200, 180],
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.3)' },
            { offset: 1, color: 'rgba(103,194,58,0.1)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化库存分布图表
const initStockChart = () => {
  const chart = echarts.init(stockChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['电子产品', '服装', '食品', '日用品']
    },
    series: [
      {
        name: '库存分布',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '电子产品' },
          { value: 735, name: '服装' },
          { value: 580, name: '食品' },
          { value: 484, name: '日用品' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 获取预警类型样式
const getWarningType = (type) => {
  const types = {
    '库存不足': 'danger',
    '即将过期': 'warning',
    '积压过多': 'info'
  }
  return types[type] || 'info'
}

// 刷新数据
const refreshData = () => {
  // 实现数据刷新逻辑
}

onMounted(() => {
  initSalesChart()
  initStockChart()
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    const salesChart = echarts.getInstanceByDom(salesChartRef.value)
    const stockChart = echarts.getInstanceByDom(stockChartRef.value)
    salesChart?.resize()
    stockChart?.resize()
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistics-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-trend.up {
  color: #67C23A;
}

.card-trend.down {
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
}

.refresh-icon {
  cursor: pointer;
  font-size: 16px;
  color: #909399;
  transition: transform 0.3s;
}

.refresh-icon:hover {
  color: #409EFF;
  transform: rotate(180deg);
}

.bottom-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-card, .warning-card {
  height: 400px;
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}
</style> 