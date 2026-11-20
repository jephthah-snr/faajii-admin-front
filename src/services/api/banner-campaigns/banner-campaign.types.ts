/**
 * Home-screen banners. These are rows of the backend `carousel` table, which
 * the app reads from `GET /v1/carousel/home` (active banners only). The admin
 * endpoints under `/admin/banner-campaigns` reuse the same service and body.
 *
 * Not to be confused with paid event publications (push / email).
 */
export interface BannerCampaign {
  id: number;
  imageUrl: string;
  /** Tapping the banner opens this event. */
  eventId: number | null;
  /** Banner stops showing after this moment. */
  expiresAt: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerCampaignInput {
  /** Required. */
  imageUrl: string;
  eventId?: number | null;
  /** Any parseable datetime; sent as ISO. */
  expiresAt?: string | null;
  isActive?: boolean;
}
