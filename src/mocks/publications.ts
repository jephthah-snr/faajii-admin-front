import type {
  AdminPublication,
  AdminPublicationDetail,
  EventReachActivity,
  PublicationStatistics,
} from "@/services/api/publications/publication.types";

/** Sample paid reach campaigns — push and email blasts hosts buy. */

export const mockPublications: AdminPublication[] = [
  {
    id: 4401,
    reference: "PUB-8F21A0",
    event: {
      id: 8842,
      eventId: "EVT-8842",
      eventSlug: "cotonou-beach-countdown",
      name: "Cotonou Beach Countdown",
      startDate: "2026-09-19T21:00:00Z",
    },
    owner: {
      userId: 2291,
      name: "Fatou Diallo",
      email: "fatou.diallo@example.bj",
    },
    channel: "push",
    title: "Beach countdown — last 200 tickets",
    message:
      "Gates open 9pm Saturday. Early bird ends tonight; grab yours before the gate price.",
    userRequestedReach: 5_000,
    deliverableReach: 4_210,
    reservedReach: 4_210,
    countryCode: "BJ",
    currency: "XOF",
    unitPrice: 15,
    totalAmount: 63_150,
    status: "completed",
    sentCount: 4_118,
    failedCount: 92,
    failureReason: null,
    breakdown: {
      abandoned_checkout: 612,
      bookmark: 1_140,
      interested_view: 1_908,
      discovery_fill: 550,
    },
    paidAt: "2026-09-05T12:04:00Z",
    completedAt: "2026-09-05T12:31:00Z",
    created_at: "2026-09-05T11:58:00Z",
  },
  {
    id: 4402,
    reference: "PUB-7C0433",
    event: {
      id: 8817,
      eventId: "EVT-8817",
      eventSlug: "lagos-owambe-adeyemi-60",
      name: "Lagos Owambe — Adeyemi at 60",
      startDate: "2026-09-13T18:00:00Z",
    },
    owner: {
      userId: 1877,
      name: "Tolu Adeyemi",
      email: "tolu.adeyemi@example.ng",
    },
    channel: "email",
    title: "You're invited — Adeyemi at 60",
    message:
      "Aso-ebi details, parking and the full running order are on the event page.",
    userRequestedReach: 3_000,
    deliverableReach: 3_000,
    reservedReach: 3_000,
    countryCode: "NG",
    currency: "NGN",
    unitPrice: 9,
    totalAmount: 27_000,
    status: "sending",
    sentCount: 1_842,
    failedCount: 11,
    failureReason: null,
    breakdown: {
      abandoned_checkout: 240,
      bookmark: 902,
      interested_view: 1_408,
      discovery_fill: 450,
    },
    paidAt: "2026-09-07T07:40:00Z",
    completedAt: null,
    created_at: "2026-09-07T07:34:00Z",
  },
  {
    id: 4403,
    reference: "PUB-5B0871",
    event: {
      id: 8790,
      eventId: "EVT-8790",
      eventSlug: "abidjan-tech-mixer",
      name: "Abidjan Tech Mixer",
      startDate: "2026-10-04T17:00:00Z",
    },
    owner: {
      userId: 3320,
      name: "Kouassi N'Guessan",
      email: "kouassi.n@example.ci",
    },
    channel: "push",
    title: "Demo night line-up is out",
    message: "Eight startups, one stage. RSVP is free but the room is small.",
    userRequestedReach: 2_500,
    deliverableReach: 1_180,
    reservedReach: 1_180,
    countryCode: "CI",
    currency: "XOF",
    unitPrice: 15,
    totalAmount: 17_700,
    status: "pending_payment",
    sentCount: 0,
    failedCount: 0,
    failureReason: null,
    breakdown: {
      abandoned_checkout: 84,
      bookmark: 316,
      interested_view: 620,
      discovery_fill: 160,
    },
    paidAt: null,
    completedAt: null,
    created_at: "2026-09-07T09:12:00Z",
  },
  {
    id: 4404,
    reference: "PUB-4A9210",
    event: {
      id: 8804,
      eventId: "EVT-8804",
      eventSlug: "sanogo-label-night",
      name: "Sanogo Sound — Label Night",
      startDate: "2026-09-27T22:00:00Z",
    },
    owner: {
      userId: 7781,
      name: "Ibrahim Sanogo",
      email: "ibrahim.sanogo@example.bj",
    },
    channel: "push",
    title: "Label night — tickets live",
    message: "Three rooms, five DJs. Advance tickets are cheapest tonight.",
    userRequestedReach: 8_000,
    deliverableReach: 6_400,
    reservedReach: 6_400,
    countryCode: "BJ",
    currency: "XOF",
    unitPrice: 15,
    totalAmount: 96_000,
    status: "completed",
    sentCount: 6_302,
    failedCount: 98,
    failureReason: null,
    breakdown: {
      abandoned_checkout: 810,
      bookmark: 1_720,
      interested_view: 2_970,
      discovery_fill: 900,
    },
    paidAt: "2026-08-30T18:22:00Z",
    completedAt: "2026-08-30T19:05:00Z",
    created_at: "2026-08-30T18:15:00Z",
  },
  {
    id: 4405,
    reference: "PUB-3E7702",
    event: {
      id: 8761,
      eventId: "EVT-8761",
      eventSlug: "porto-novo-wedding",
      name: "Porto-Novo Wedding — Sowe × Kponou",
      startDate: "2026-11-14T12:00:00Z",
    },
    owner: {
      userId: 5102,
      name: "Rachelle Sowe",
      email: "rachelle.sowe@example.bj",
    },
    channel: "email",
    title: "Save the date — 14 November",
    message: "Ceremony at noon, reception from 4pm. Dress code inside.",
    userRequestedReach: 1_200,
    deliverableReach: 1_200,
    reservedReach: 1_200,
    countryCode: "BJ",
    currency: "XOF",
    unitPrice: 10,
    totalAmount: 12_000,
    status: "failed",
    sentCount: 214,
    failedCount: 986,
    failureReason: "Email provider rejected the batch — sender domain unverified",
    breakdown: {
      abandoned_checkout: 40,
      bookmark: 380,
      interested_view: 600,
      discovery_fill: 180,
    },
    paidAt: "2026-08-26T10:02:00Z",
    completedAt: "2026-08-26T10:19:00Z",
    created_at: "2026-08-26T09:55:00Z",
  },
  {
    id: 4406,
    reference: "PUB-2D3155",
    event: {
      id: 8842,
      eventId: "EVT-8842",
      eventSlug: "cotonou-beach-countdown",
      name: "Cotonou Beach Countdown",
      startDate: "2026-09-19T21:00:00Z",
    },
    owner: {
      userId: 2291,
      name: "Fatou Diallo",
      email: "fatou.diallo@example.bj",
    },
    channel: "email",
    title: "You left tickets in your cart",
    message: "Your two regular tickets are still waiting. Checkout takes a minute.",
    userRequestedReach: 900,
    deliverableReach: 612,
    reservedReach: 612,
    countryCode: "BJ",
    currency: "XOF",
    unitPrice: 10,
    totalAmount: 6_120,
    status: "paid",
    sentCount: 0,
    failedCount: 0,
    failureReason: null,
    breakdown: {
      abandoned_checkout: 612,
      bookmark: 0,
      interested_view: 0,
      discovery_fill: 0,
    },
    paidAt: "2026-09-07T08:48:00Z",
    completedAt: null,
    created_at: "2026-09-07T08:44:00Z",
  },
];

export const mockPublicationStatistics: PublicationStatistics = {
  totalCampaigns: 1_284,
  pendingPayment: 18,
  delivered: 942_610,
  failed: 12_884,
  spend: [
    { currency: "XOF", amount: 14_820_000, campaigns: 806 },
    { currency: "NGN", amount: 5_310_000, campaigns: 478 },
  ],
  byChannel: [
    { channel: "push", campaigns: 902, delivered: 704_118 },
    { channel: "email", campaigns: 382, delivered: 238_492 },
  ],
};

const recipientNames = [
  "Ngozi Eze",
  "Samuel Ade",
  "Amina Bello",
  "Kouassi N'Guessan",
  "Rachelle Sowe",
  "Ibrahim Sanogo",
  "Chinedu Okafor",
  "Tolu Adeyemi",
];

export const mockPublicationDetail = (
  reference: string | null | undefined,
): AdminPublicationDetail => {
  const campaign =
    mockPublications.find((row) => row.reference === reference) ||
    mockPublications[0];

  const recipients = recipientNames.map((name, index) => {
    const reasons = [
      "abandoned_checkout",
      "bookmark",
      "interested_view",
      "discovery_fill",
    ] as const;
    const failed = campaign.failedCount > 0 && index === 5;
    const pending = campaign.sentCount === 0;

    return {
      id: campaign.id * 100 + index,
      userId: 2200 + index,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      selectionReason: reasons[index % reasons.length],
      status: pending
        ? ("pending" as const)
        : failed
          ? ("failed" as const)
          : ("sent" as const),
      providerReference: pending ? null : `FCM-${campaign.id}-${index}`,
      failureReason: failed ? "Device token no longer registered" : null,
      sentAt: pending ? null : campaign.paidAt,
    };
  });

  const breakdown = campaign.breakdown
    ? (
        [
          "abandoned_checkout",
          "bookmark",
          "interested_view",
          "discovery_fill",
        ] as const
      ).flatMap((reason) => {
        const total = campaign.breakdown?.[reason] || 0;
        if (total === 0) return [];
        const failedShare =
          campaign.failedCount > 0
            ? Math.round(
                total * (campaign.failedCount / (campaign.deliverableReach || 1)),
              )
            : 0;
        const sentShare =
          campaign.sentCount === 0 ? 0 : Math.max(total - failedShare, 0);
        const pendingShare = total - sentShare - failedShare;

        return [
          { selectionReason: reason, status: "sent" as const, count: sentShare },
          {
            selectionReason: reason,
            status: "failed" as const,
            count: failedShare,
          },
          {
            selectionReason: reason,
            status: "pending" as const,
            count: pendingShare,
          },
        ].filter((row) => row.count > 0);
      })
    : [];

  return { campaign, recipients, breakdown };
};

/** Campaigns bought for one event — the per-event Reach tab. */
export const mockEventPublications: AdminPublication[] = mockPublications.filter(
  (campaign) => campaign.event?.id === 8842,
);

export const mockEventReachActivity: EventReachActivity = {
  view: 12_840,
  abandoned_checkout: 612,
  bookmark: 1_140,
  totalInterested: 4_210,
};
