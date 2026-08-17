/**
 * Gift links — the "Receive Gifts" pages (Secret Santa / Birthday) users create
 * to collect cash without hosting a full event.
 *
 * Note: in `faajii-mobile-core` this feature is still device-local
 * (`src/modules/giftlinks/services/giftLinksStore.ts` persists to AsyncStorage
 * and seeds sample well-wishers). Admin visibility therefore depends on the
 * feature getting a backend first, not just an admin route.
 */

export type GiftLinkType = "secretSanta" | "birthday";

export type GiftLinkStatus = "active" | "closed" | "suspended";

export interface AdminWellWisher {
  id: string;
  name: string;
  anonymous: boolean;
  amount: number | null;
  currency: string;
  message: string | null;
  /** Payment reference, so a contribution can be traced to a transaction. */
  reference: string | null;
  created_at: string;
}

export interface AdminGiftLink {
  id: string;
  type: GiftLinkType;
  /** www.faajii.com/gift/<slug> */
  slug: string;
  title: string;
  themeId: string | null;
  deliveryAddress: string | null;
  userId: number;
  ownerName: string | null;
  ownerEmail: string | null;
  status: GiftLinkStatus;
  currency: string;
  totalRaised: number;
  contributorCount: number;
  settledAmount: number;
  created_at: string;
}

export interface AdminGiftLinkDetail extends AdminGiftLink {
  wellWishers: AdminWellWisher[];
}

export interface GiftLinkFilters {
  page: number;
  limit: number;
  search?: string;
  type?: GiftLinkType;
  status?: GiftLinkStatus;
}
