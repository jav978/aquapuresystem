import { defineNuxtPlugin } from '#app';
import { cn, formatDate, formatDateTime, formatCurrency, formatNumber, truncate, slugify, getInitials } from '@aquasystem/design-system';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('cn', cn);
  nuxtApp.provide('formatDate', formatDate);
  nuxtApp.provide('formatDateTime', formatDateTime);
  nuxtApp.provide('formatCurrency', formatCurrency);
  nuxtApp.provide('formatNumber', formatNumber);
  nuxtApp.provide('truncate', truncate);
  nuxtApp.provide('slugify', slugify);
  nuxtApp.provide('getInitials', getInitials);
});