export type IntegrationStatus = "active" | "suspended" | "revoked";

export interface IntegrationBusiness {
  id: number;
  businessId: string;
  name: string;
  slug: string;
  legalName?: string | null;
  contactName?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  status: IntegrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationBusinessPayload {
  name: string;
  slug: string;
  legalName?: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
}
