export type KycReviewStatus = "pending" | "verified" | "rejected" | "incomplete";
export type KycPartStatus = "not_started" | "pending" | "verified" | "rejected";

export interface KycSubmission {
  userId: number;
  user: { fullname: string; email: string; phoneNumber: string; avatar?: string | null };
  countryIso?: "BJ" | "NG" | "CI" | null;
  documentType?: string | null;
  identity: { status: KycPartStatus; label?: string | null; submittedAt?: string | null; reviewedAt?: string | null; reason?: string | null };
  selfie: { status: KycPartStatus; label?: string | null; submittedAt?: string | null; reviewedAt?: string | null; reason?: string | null };
  status: KycReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface KycSubmissionDetail extends KycSubmission {
  documentNumber?: string | null;
  evidence: { documentFrontUrl?: string | null; documentBackUrl?: string | null; selfieUrl?: string | null };
  history: KycSubmissionHistory[];
}

export interface KycSubmissionHistory {
  id: number;
  submissionType: "identity" | "selfie";
  status: KycPartStatus;
  statusLabel?: string | null;
  reason?: string | null;
  countryIso?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  archivedAt: string;
  evidence: { documentFrontUrl?: string | null; documentBackUrl?: string | null; selfieUrl?: string | null };
}

export interface KycStats { total: number; pending: number; verified: number; rejected: number; incomplete: number }
