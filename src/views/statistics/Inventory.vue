<template>
  <div class="inventory-statistics-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存统计</span>
        </div>
      </template>

      <!-- 统计图表区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <div ref="categoryChartRef" style="height: 400px"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <div ref="trendChartRef" style="height: 400px"></div>
          </div>
        </el-col>
      </el-row>

      <!-- 统计数据表格 -->
      <el-table :data="tableData" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="category" label="商品类别" width="150" />
        <el-table-column prop="totalQuantity" label="库存总量" width="120" />
        <el-table-column prop="totalAmount" label="库存金额" width="150" />
        <el-table-column prop="inQuantity" label="本月入库量" width="120" />
        <el-table-column prop="outQuantity" label="本月出库量" width="120" />
        <el-table-column prop="turnoverRate" label="周转率" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const categoryChartRef = ref(null)
const trendChartRef = ref(null)

const tableData = ref([
  {
    category: '电子产品',
    totalQuantity: 1000,
    totalAmount: 1000000,
    inQuantity: 200,
    outQuantity: 150,
    turnoverRate: '15%'
  }
  // 更多数据...
])

// 初始化商品类别分布图表
const initCategoryChart = () => {
  const chart = echarts.init(categoryChartRef.value)
  const option = {
    title: {
      text: '商品类别库存分布'
    },
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
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '30',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1000, name: '电子产品' },
          { value: 800, name: '服装' },
          { value: 500, name: '食品' },
          { value: 300, name: '日用品' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化库存趋势图表
const initTrendChart = () => {
  const chart = echarts.init(trendChartRef.value)
  const option = {
    title: {
      text: '库存趋势分析'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['库存量', '入库量', '出库量']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '库存量',
        type: 'line',
        data: [1000, 1200, 1100, 1300, 1400, 1500]
      },
      {
        name: '入库量',
        type: 'bar',
        data: [200, 300, 200, 400, 300, 300]
      },
      {
        name: '出库量',
        type: 'bar',
        data: [100, 200, 300, 200, 200, 200]
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  initCategoryChart()
  initTrendChart()
})
</script>

<style scoped>
.inventory-statistics-container {
  padding: 20px;
}

.chart-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style> 