import { ref, computed } from 'vue';

export interface PosDraftState {
  transactionId: string;
  isQuickSale: boolean;
  customerForm: {
    type: 'NATURAL' | 'JURIDICO';
    docType: 'V' | 'E' | 'J' | 'G';
    docNumber: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  cartItems: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    waterLiters: number;
  }[];
  paymentForm: {
    method: 'CASH_USD' | 'CASH_VES' | 'PAGO_MOVIL' | 'TRANSFER' | 'POS_CARD';
    receivedAmount: number;
    bankName: string;
    referenceNumber: string;
    authCode: string;
  };
  salePaymentStatus: 'PAID' | 'PENDING';
  totalUsd: number;
  totalLiters: number;
  savedAt: string; // ISO String
}

const DRAFT_STORAGE_KEY = 'aquapure_pos_draft_v1';

export function usePosDraft() {
  const currentDraft = ref<PosDraftState | null>(null);

  const loadDraftFromStorage = (): PosDraftState | null => {
    if (typeof localStorage === 'undefined') return null;
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) {
        currentDraft.value = null;
        return null;
      }
      const parsed: PosDraftState = JSON.parse(stored);
      // Valid draft must have cart items or filled customer
      const hasContent =
        (parsed.cartItems && parsed.cartItems.length > 0) ||
        (parsed.customerForm && parsed.customerForm.name?.trim().length > 0);

      if (hasContent) {
        currentDraft.value = parsed;
        return parsed;
      } else {
        clearDraft();
        return null;
      }
    } catch {
      clearDraft();
      return null;
    }
  };

  const saveDraft = (draft: Omit<PosDraftState, 'savedAt' | 'totalUsd' | 'totalLiters'>) => {
    if (typeof localStorage === 'undefined') return;
    try {
      const totalUsd = draft.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalLiters = draft.cartItems.reduce(
        (sum, item) => sum + (item.waterLiters || 0) * item.quantity,
        0
      );

      const fullDraft: PosDraftState = {
        ...draft,
        totalUsd: Math.round(totalUsd * 100) / 100,
        totalLiters,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fullDraft));
      currentDraft.value = fullDraft;
    } catch (e) {
      console.error('[PosDraft] Error saving draft:', e);
    }
  };

  const clearDraft = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      currentDraft.value = null;
    } catch (e) {
      console.error('[PosDraft] Error clearing draft:', e);
    }
  };

  const hasDraft = computed(() => {
    return currentDraft.value !== null && currentDraft.value.cartItems.length > 0;
  });

  const formatDraftDate = (isoStr?: string): string => {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  // Generate unique transaction ID for idempotency
  const generateTransactionId = (): string => {
    return 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  };

  // Initialize draft check
  loadDraftFromStorage();

  return {
    currentDraft,
    hasDraft,
    loadDraftFromStorage,
    saveDraft,
    clearDraft,
    formatDraftDate,
    generateTransactionId,
  };
}
