<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { computed, ref } from 'vue';
import { useBreakpoints } from '@vueuse/core';

const tableVariants = cva(
  'w-full text-sm',
  {
    variants: {
      striped: {
        true: '',
      },
      hoverable: {
        true: '',
      },
    },
    defaultVariants: {
      striped: true,
      hoverable: true,
    },
  }
);

interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  mobile?: boolean;
  tablet?: boolean;
  render?: (value: any, row: T, column: Column<T>) => any;
  headerClass?: string;
  cellClass?: string;
}

interface Props<T = any> {
  data: T[];
  columns: Column<T>[];
  keyField: string;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  striped: true,
  hoverable: true,
  emptyMessage: 'No data available',
});

const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc'];
  pageChange: [page: number];
  rowClick: [row: any];
  selectionChange: [selected: any[]];
}>();

const { greaterOrEqual: isDesktop } = useBreakpoints({ tablet: 768, desktop: 1024 });
const selectedRows = ref<Set<any>>(new Set());
const sortBy = ref(props.sortBy);
const sortOrder = ref(props.sortOrder || 'desc');

const visibleColumns = computed(() => {
  if (isDesktop.value) return props.columns;
  return props.columns.filter((c) => c.mobile !== false);
});

const tableClasses = computed(() => tableVariants({ striped: props.striped, hoverable: props.hoverable }));

const handleSort = (column: Column) => {
  if (!column.sortable) return;
  if (sortBy.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column.key;
    sortOrder.value = 'asc';
  }
  emit('sort', column.key, sortOrder.value);
};

const toggleRowSelection = (row: any) => {
  if (selectedRows.value.has(row[props.keyField])) {
    selectedRows.value.delete(row[props.keyField]);
  } else {
    selectedRows.value.add(row[props.keyField]);
  }
  emit('selectionChange', Array.from(selectedRows.value).map((id) => props.data.find((r) => r[props.keyField] === id)).filter(Boolean));
};

const toggleAllSelection = () => {
  if (selectedRows.value.size === props.data.length) {
    selectedRows.value.clear();
  } else {
    props.data.forEach((row) => selectedRows.value.add(row[props.keyField]));
  }
  emit('selectionChange', Array.from(selectedRows.value).map((id) => props.data.find((r) => r[props.keyField] === id)).filter(Boolean));
};

const isRowSelected = (row: any) => selectedRows.value.has(row[props.keyField]);
const allSelected = computed(() => selectedRows.value.size === props.data.length && props.data.length > 0);

const handleRowClick = (row: any) => {
  emit('rowClick', row);
};

const handlePageChange = (page: number) => {
  emit('pageChange', page);
};
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-outline-variant dark:border-outline-variant">
    <table :class="tableClasses">
      <thead class="bg-surface-container dark:bg-surface-container-dark sticky top-0 z-10">
        <tr>
          <template v-for="column in visibleColumns" :key="column.key">
            <th
              :class="[
                'px-4 py-3 text-left font-medium text-on-surface-variant dark:text-on-surface-variant',
                column.headerClass,
                column.sortable && 'cursor-pointer select-none hover:bg-surface-container-highest dark:hover:bg-surface-container-high',
              ]"
              :style="{ width: column.width, textAlign: column.align }"
              @click="column.sortable && handleSort(column)"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <span v-if="column.sortable" class="text-on-surface-variant/50 dark:text-on-surface-variant/50">
                  <svg v-if="sortBy !== column.key" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 16V4m0 0l4 4m-4-4l-4 4"></path></svg>
                  <svg v-else-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </div>
            </th>
          </template>
        </tr>
      </thead>
      <tbody class="divide-y divide-outline-variant dark:divide-outline-variant">
        <tr v-if="props.loading" class="animate-pulse">
          <td :colspan="visibleColumns.length" class="px-4 py-8 text-center text-on-surface-variant dark:text-on-surface-variant">
            <div class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading...
            </div>
          </td>
        </tr>
        <tr v-else-if="props.data.length === 0">
          <td :colspan="visibleColumns.length" class="px-4 py-8 text-center text-on-surface-variant dark:text-on-surface-variant">
            {{ props.emptyMessage }}
          </td>
        </tr>
        <tr
          v-else
          v-for="row in props.data"
          :key="row[props.keyField]"
          :class="[
            'transition-colors',
            props.hoverable && 'hover:bg-surface-container-highest/50 dark:hover:bg-surface-container-high/50',
            isRowSelected(row) && 'bg-primary/10 dark:bg-primary-dark/10',
          ]"
          @click="handleRowClick(row)"
        >
          <template v-for="column in visibleColumns" :key="column.key">
            <td :class="['px-4 py-3', column.cellClass]" :style="{ textAlign: column.align }">
              <component
                v-if="column.render"
                :is="column.render"
                :value="row[column.key]"
                :row="row"
                :column="column"
              />
              <span v-else>{{ row[column.key] }}</span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <!-- Mobile Card View -->
    <div v-if="!isDesktop" class="block md:hidden p-4 space-y-4">
      <div v-for="row in props.data" :key="row[props.keyField]" class="card p-4 space-y-2" :class="isRowSelected(row) ? 'ring-2 ring-primary dark:ring-primary-dark' : ''" @click="handleRowClick(row)">
        <template v-for="column in visibleColumns" :key="column.key">
          <div class="flex justify-between">
            <span class="text-label-sm text-on-surface-variant dark:text-on-surface-variant">{{ column.label }}</span>
            <component
              v-if="column.render"
              :is="column.render"
              :value="row[column.key]"
              :row="row"
              :column="column"
            />
            <span v-else class="font-medium text-on-surface dark:text-on-surface">{{ row[column.key] }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- Pagination -->
  <div v-if="props.pagination && props.pagination.total > props.pagination.limit" class="flex items-center justify-between mt-4 px-2">
    <div class="text-label-sm text-on-surface-variant dark:text-on-surface-variant">
      Showing {{ (props.pagination.page - 1) * props.pagination.limit + 1 }} to {{ Math.min(props.pagination.page * props.pagination.limit, props.pagination.total) }} of {{ props.pagination.total }}
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="handlePageChange(props.pagination.page - 1)"
        :disabled="props.pagination.page === 1"
        class="btn-ghost btn-sm"
        aria-label="Previous page"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <span class="text-label-md font-medium text-on-surface dark:text-on-surface">
        Page {{ props.pagination.page }} of {{ Math.ceil(props.pagination.total / props.pagination.limit) }}
      </span>
      <button
        @click="handlePageChange(props.pagination.page + 1)"
        :disabled="props.pagination.page >= Math.ceil(props.pagination.total / props.pagination.limit)"
        class="btn-ghost btn-sm"
        aria-label="Next page"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>
  </div>
</template>