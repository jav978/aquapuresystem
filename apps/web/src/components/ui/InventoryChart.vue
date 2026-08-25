<template>
  <canvas class="w-full h-full" ref="chartRef"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { formatNumber } from '@aquasystem/design-system';

interface Props {
  data: Array<{ category: string; stock: number; min: number }>;
}

const props = defineProps<Props>();
const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = async () => {
  if (!chartRef.value) return;
  
  await nextTick();
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartRef.value.getContext('2d');
  if (!ctx) return;

  const labels = props.data.map(d => d.category);
  const stockData = props.data.map(d => d.stock);
  const minData = props.data.map(d => d.min);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Current Stock',
          data: stockData,
          backgroundColor: (context) => {
            const value = context.raw as number;
            const min = minData[context.dataIndex];
            return value <= min ? 'rgba(186, 26, 26, 0.8)' : value <= min * 1.5 ? 'rgba(140, 90, 0, 0.8)' : 'rgba(0, 88, 188, 0.8)';
          },
          borderColor: (context) => {
            const value = context.raw as number;
            const min = minData[context.dataIndex];
            return value <= min ? 'rgb(186, 26, 26)' : value <= min * 1.5 ? 'rgb(140, 90, 0)' : 'rgb(0, 88, 188)';
          },
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Minimum Level',
          data: minData,
          type: 'line',
          borderColor: 'rgba(140, 90, 0, 0.8)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { family: 'Inter', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(25, 28, 30, 0.9)',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatNumber(context.raw as number)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(113, 119, 134, 0.1)' },
          title: { display: true, text: 'Units in Stock', font: { family: 'Inter', size: 11 } },
          ticks: { font: { family: 'Inter', size: 11 } },
        },
      },
    },
  });
};

onMounted(() => {
  createChart();
});

watch(() => props.data, () => {
  createChart();
}, { deep: true });
</script>