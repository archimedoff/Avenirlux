import type { PaymentIntentPayload } from "@/lib/reservation/types";

export interface PaymentGateway {
  createIntent(payload: PaymentIntentPayload): Promise<{ clientSecret: string; intentId: string }>;
  confirmPayment(intentId: string): Promise<{ success: boolean; transactionId?: string }>;
}

export class MockPaymentGateway implements PaymentGateway {
  async createIntent(payload: PaymentIntentPayload) {
    return {
      clientSecret: `mock_secret_${payload.reservation.hotelId}`,
      intentId: `mock_pi_${Date.now()}`,
    };
  }
  async confirmPayment(_intentId: string) {
    return { success: true, transactionId: `mock_txn_${Date.now()}` };
  }
}

export const paymentGateway: PaymentGateway = new MockPaymentGateway();
