/** Future integration contracts. No adapter is connected or invoked in the demo. */
export type IntegrationResult = { externalId: string; deliveredAt?: string };
export interface MessagingAdapter {
  send(input: {
    recipientId: string;
    template: string;
    reservationId: string;
  }): Promise<IntegrationResult>;
}
export interface PaymentAdapter {
  createIntent(input: {
    reservationId: string;
    amount: number;
    currency: "DOP" | "USD";
  }): Promise<{ redirectUrl: string; externalId: string }>;
}
export interface SignatureAdapter {
  requestSignature(input: {
    agreementId: string;
    documentId: string;
  }): Promise<IntegrationResult>;
}
export interface StorageAdapter {
  upload(input: {
    file: Blob;
    kind: "document" | "inspection";
    ownerId: string;
  }): Promise<{ id: string; url: string }>;
}
export interface TelematicsAdapter {
  readVehicle(
    vehicleId: string,
  ): Promise<{
    km: number;
    latitude?: number;
    longitude?: number;
    observedAt: string;
  }>;
}
export interface AccountingAdapter {
  exportMovement(paymentId: string): Promise<IntegrationResult>;
}
export const integrationStatus = {
  whatsapp: "disconnected",
  email: "disconnected",
  payments: "disconnected",
  signature: "disconnected",
  storage: "local-demo",
  telematics: "disconnected",
  accounting: "disconnected",
  maps: "disconnected",
} as const;
