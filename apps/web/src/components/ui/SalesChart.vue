<template>
  <canvas class="w-full h-full" ref="chartRef"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { formatCurrency, formatDate } from '@aquasystem/design-system';

interface Props {
  data: Array<{ date: string; sales: number; revenue: number }>;
  period: string;
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

  const labels = props.data.map(d => formatDate(d.date));
  const salesData = props.data.map(d => d.sales);
  const revenueData = props.data.map(d => d.revenue);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: salesData,
          backgroundColor: 'rgba(0, 88, 188, 0.8)',
          borderColor: 'rgb(0, 88, 188)',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'Revenue',
          data: revenueData,
          type: 'line',
          borderColor: 'rgb(0, 104, 74)',
          backgroundColor: 'rgba(0, 104, 74, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: {
              family: 'Inter',
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(25, 28, 30, 0.9)',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.raw as number;
              return `${label}: ${context.dataset.type === 'line' ? formatCurrency(value) : value}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            maxRotation: 0,
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Sales Count', font: { family: 'Inter', size: 11 } },
          grid: { color: 'rgba(113, 119, 134, 0.1)' },
          beginAtZero: true,
          ticks: { font: { family: 'Inter', size: 11 } },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Revenue', font: { family: 'Inter', size: 11 } },
          grid: { drawOnChartArea: false },
          beginAtZero: true,
          ticks: {
            font: { family: 'Inter', size: 11 },
            callback: (value) => formatCurrency(value as number),
          },
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

watch(() => props.period, () => {
  createChart();
});
</script>