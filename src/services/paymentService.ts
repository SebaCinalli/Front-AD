import axios from 'axios';

export interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export interface CreatePaymentResponse {
  init_point: string;
}

export interface ConfirmPaymentResponse {
  confirmed: boolean;
  paymentStatus?: string;
  solicitudId?: number | null;
  result?: string;
  reason?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const API_BASE = API_URL.replace(/\/+$/, '');
const API_PREFIX = API_BASE
  ? API_BASE.endsWith('/api')
    ? API_BASE
    : `${API_BASE}/api`
  : '/api';

export const paymentService = {
  /**
   * Crea una preferencia de pago en MercadoPago
   * @param items - Array de items a pagar
   * @param solicitudId - ID de la solicitud asociada al pago
   * @returns URL de checkout de MercadoPago
   */
  createPayment: async (
    items: PaymentItem[],
    solicitudId?: number | null,
  ): Promise<CreatePaymentResponse> => {
    try {
      const payload: { items: PaymentItem[]; solicitudId?: number } = { items };
      if (typeof solicitudId === 'number' && solicitudId > 0) {
        payload.solicitudId = solicitudId;
      }

      const response = await axios.post(
        `${API_PREFIX}/payment/create-payment`,
        payload,
        { withCredentials: true },
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al crear el pago';
      throw new Error(errorMessage);
    }
  },

  /**
   * Confirma un pago aprobado contra MercadoPago en el backend
   */
  confirmPayment: async (params: {
    paymentId?: string | null;
    solicitudId?: number | null;
  }): Promise<ConfirmPaymentResponse> => {
    const response = await axios.post(
      `${API_PREFIX}/payment/confirm`,
      params,
      { withCredentials: true },
    );
    return response.data;
  },

  /**
   * Procesa los items del carrito para enviarlos a MercadoPago
   */
  formatCartItemsForPayment: (cartItems: any[]): PaymentItem[] => {
    return cartItems.map((item) => ({
      id: `${item.type}-${item.id}`,
      title: item.name,
      quantity: 1,
      unit_price: item.price,
    }));
  },
};
