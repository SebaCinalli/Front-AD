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
   * @returns URL de checkout de MercadoPago
   */
  createPayment: async (
    items: PaymentItem[],
  ): Promise<CreatePaymentResponse> => {
    try {
      const response = await axios.post(
        `${API_PREFIX}/payment/create-payment`,
        { items },
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
