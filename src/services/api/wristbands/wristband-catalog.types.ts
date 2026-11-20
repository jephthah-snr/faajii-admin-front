/**
 * Wristband catalog — what creators can order in the app.
 *
 * The app reads `GET /v1/wristbands/catalog` (rows of `{id, code, name,
 * description, unitPrice, currency, images[], palette[], minimumQuantity}`).
 * These shapes are the admin side of that same record: the app's row is the
 * admin product resolved to the buyer's market, so `pricing` here fans out to
 * the app's single `unitPrice` + `currency`.
 */

export interface WristbandPricing {
  /** Market currency, e.g. XOF or NGN. */
  currency: string;
  /** What the creator pays per band. */
  unitPrice: number;
  /**
   * What a band costs Faajii to produce. Admin-only — never sent to the app.
   * Wristband revenue is `unitPrice − productionCost` per band.
   */
  productionCost: number;
}

export interface AdminWristbandProduct {
  id: number;
  /** Stable slug the app and orders refer to (e.g. `satin-white`). */
  code: string;
  name: string;
  description: string | null;
  /** Cover photo first. Absolute URLs. */
  images: string[];
  /** Band colours as hex. Entry 0 is the natural colour. */
  palette: string[];
  minQuantity: number;
  pricing: WristbandPricing[];
  /** Shown in the app catalog. */
  isActive: boolean;
  /** Ascending; lower shows first. */
  sortOrder: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WristbandProductInput {
  /** Required on create, ignored on update — the code never changes. */
  code?: string;
  name: string;
  description: string;
  images: string[];
  palette: string[];
  minQuantity: number;
  pricing: WristbandPricing[];
  isActive: boolean;
  sortOrder: number;
}

export interface UploadedWristbandImage {
  url: string;
}
