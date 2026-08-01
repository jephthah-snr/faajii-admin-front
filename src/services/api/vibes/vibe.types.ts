import { Pagination } from "../utils/utils.types";

export type VibeModerationStatus =
  | "active"
  | "hidden"
  | "disabled"
  | "flagged";

export interface AdminVibe {
  id: number;
  ref: string;
  caption: string;
  mediaType: "image" | "video";
  playbackUrl: string;
  playbackContentType: string;
  posterUrl: string;
  moderationStatus: VibeModerationStatus;
  moderationReason?: string | null;
  moderatedAt?: string | null;
  createdAt: string;
  counts: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    reports: number;
  };
  author: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  event: {
    id: number;
    eventId: string;
    name: string;
    slug: string;
    startDate?: string | null;
  };
}

export interface AdminVibesPage {
  data: AdminVibe[];
  pagination: Pagination;
}
