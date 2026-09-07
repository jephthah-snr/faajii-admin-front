import type { AdminEventPlanner } from "@/services/api/event/admin-event.types";
import type {
  AdminDiscountCode,
  AdminEventBudget,
  AdminEventCheckIn,
  AdminEventCheckInSummary,
  AdminEventSponsor,
  AdminEventTask,
  AdminEventWallet,
} from "@/services/api/event-ops/event-ops.types";

/**
 * Sample event operations data — one coherent event (a Cotonou beach party) so
 * the tabs read as the same event rather than five unrelated fixtures.
 */

const EVENT_ID = 8842;

/* -------------------------------- Check-ins ------------------------------- */

const guestNames = [
  "Amina Bello",
  "Kouassi N'Guessan",
  "Rachelle Sowe",
  "Ibrahim Sanogo",
  "Tolu Adeyemi",
  "Chinedu Okafor",
  "Ngozi Eze",
  "Samuel Ade",
  "Marie Kponou",
  "Yao Kablan",
  "Zainab Musa",
  "Eric Dossou",
];

export const mockCheckIns: AdminEventCheckIn[] = guestNames.map(
  (name, index) => {
    const checkedIn = index % 3 !== 2;
    return {
      id: 20_000 + index,
      eventId: EVENT_ID,
      guestId: 30_000 + index,
      guestName: name,
      guestPhone: index % 2 === 0 ? `+229 97 4${index} 22 0${index}` : null,
      guestEmail:
        index % 2 === 1
          ? `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`
          : null,
      ticketReference: `TKT-88${420 + index}`,
      ticketType: index % 4 === 0 ? "VIP table" : "Regular",
      checkedIn,
      checkedInAt: checkedIn
        ? `2026-09-06T2${index % 3}:1${index % 6}:00Z`
        : null,
      checkedInBy: checkedIn
        ? index % 2 === 0
          ? "Gate 1 · Fatou"
          : "Gate 2 · Ibrahim"
        : null,
    };
  },
);

export const mockCheckInSummary: AdminEventCheckInSummary = {
  totalGuests: 412,
  checkedIn: 274,
  notCheckedIn: 138,
  checkInRate: 66.5,
  lastCheckInAt: "2026-09-06T23:48:00Z",
};

/* --------------------------------- Budget --------------------------------- */

export const mockEventBudget: AdminEventBudget = {
  currency: "XOF",
  totalBudgeted: 3_400_000,
  totalSpent: 2_186_000,
  items: [
    {
      id: 1,
      eventId: EVENT_ID,
      userId: 2291,
      item: "Sound & lighting",
      amount: 1_200_000,
      amountSpent: 1_200_000,
      itemColor: "#5769E9",
      createdAt: "2026-07-02T10:00:00Z",
      updatedAt: "2026-09-01T14:20:00Z",
    },
    {
      id: 2,
      eventId: EVENT_ID,
      userId: 2291,
      item: "Drinks & bar stock",
      amount: 900_000,
      amountSpent: 640_000,
      itemColor: "#63E6BE",
      createdAt: "2026-07-02T10:02:00Z",
      updatedAt: "2026-09-04T09:11:00Z",
    },
    {
      id: 3,
      eventId: EVENT_ID,
      userId: 2291,
      item: "Security",
      amount: 450_000,
      amountSpent: 300_000,
      itemColor: "#F5C912",
      createdAt: "2026-07-02T10:04:00Z",
      updatedAt: "2026-08-30T17:45:00Z",
    },
    {
      id: 4,
      eventId: EVENT_ID,
      userId: 2291,
      item: "Decor",
      amount: 350_000,
      amountSpent: 46_000,
      itemColor: "#D0BFFF",
      createdAt: "2026-07-02T10:06:00Z",
      updatedAt: "2026-08-22T12:00:00Z",
    },
    {
      id: 5,
      eventId: EVENT_ID,
      userId: 2291,
      item: "Promoter commission",
      amount: 500_000,
      amountSpent: 0,
      itemColor: "#FF8787",
      createdAt: "2026-08-02T10:10:00Z",
      updatedAt: "2026-08-02T10:10:00Z",
    },
  ],
};

/* ---------------------------------- Tasks --------------------------------- */

export const mockEventTasks: AdminEventTask[] = [
  {
    id: 1,
    eventId: EVENT_ID,
    createdBy: 2291,
    createdByName: "Fatou Diallo",
    assigneeId: 7781,
    assigneeName: "Ibrahim Sanogo",
    title: "Confirm DJ set times",
    description: "Three rooms, 30-minute changeovers.",
    deadline: "2026-09-12T18:00:00Z",
    status: "in_progress",
    createdAt: "2026-08-20T09:00:00Z",
    updatedAt: "2026-09-05T16:20:00Z",
  },
  {
    id: 2,
    eventId: EVENT_ID,
    createdBy: 2291,
    createdByName: "Fatou Diallo",
    assigneeId: null,
    assigneeName: null,
    title: "Order 400 wristbands",
    description: "Match the poster colours; delivery to the beach club.",
    deadline: "2026-09-08T12:00:00Z",
    status: "overdue",
    createdAt: "2026-08-18T11:30:00Z",
    updatedAt: "2026-08-18T11:30:00Z",
  },
  {
    id: 3,
    eventId: EVENT_ID,
    createdBy: 2291,
    createdByName: "Fatou Diallo",
    assigneeId: 5102,
    assigneeName: "Rachelle Sowe",
    title: "Confirm bar stock with supplier",
    description: null,
    deadline: "2026-09-15T10:00:00Z",
    status: "completed",
    createdAt: "2026-08-15T08:12:00Z",
    updatedAt: "2026-09-03T14:02:00Z",
  },
  {
    id: 4,
    eventId: EVENT_ID,
    createdBy: 7781,
    createdByName: "Ibrahim Sanogo",
    assigneeId: 2291,
    assigneeName: "Fatou Diallo",
    title: "Send press list to the door",
    description: "12 names, photo pass only.",
    deadline: "2026-09-18T20:00:00Z",
    status: "pending",
    createdAt: "2026-09-01T19:40:00Z",
    updatedAt: "2026-09-01T19:40:00Z",
  },
  {
    id: 5,
    eventId: EVENT_ID,
    createdBy: 2291,
    createdByName: "Fatou Diallo",
    assigneeId: null,
    assigneeName: null,
    title: "Book second generator",
    description: "Backup for the main stage.",
    deadline: null,
    status: "cancelled",
    createdAt: "2026-07-29T13:05:00Z",
    updatedAt: "2026-08-11T10:00:00Z",
  },
];

/* -------------------------------- Sponsors -------------------------------- */

export const mockEventSponsors: AdminEventSponsor[] = [
  {
    id: 1,
    eventId: EVENT_ID,
    name: "MTN Benin",
    logoUrl: "",
    websiteUrl: "https://mtn.bj",
    displayOrder: 1,
    createdAt: "2026-07-10T09:00:00Z",
    updatedAt: "2026-07-10T09:00:00Z",
  },
  {
    id: 2,
    eventId: EVENT_ID,
    name: "Beninoise Brasserie",
    logoUrl: "",
    websiteUrl: null,
    displayOrder: 2,
    createdAt: "2026-07-12T15:20:00Z",
    updatedAt: "2026-07-12T15:20:00Z",
  },
  {
    id: 3,
    eventId: EVENT_ID,
    name: "Sable Nights",
    logoUrl: "",
    websiteUrl: "https://sablenights.bj",
    displayOrder: 3,
    createdAt: "2026-07-18T11:04:00Z",
    updatedAt: "2026-07-18T11:04:00Z",
  },
];

/* ----------------------------- Discount codes ----------------------------- */

export const mockDiscountCodes: AdminDiscountCode[] = [
  {
    id: 1,
    eventId: EVENT_ID,
    code: "EARLYBIRD",
    type: "percent",
    value: 20,
    scope: "event",
    offerId: null,
    maxUses: 200,
    usedCount: 200,
    expiresAt: "2026-09-01T23:59:00Z",
    isActive: false,
    createdAt: "2026-07-05T10:00:00Z",
    updatedAt: "2026-09-02T00:01:00Z",
  },
  {
    id: 2,
    eventId: EVENT_ID,
    code: "SABLE10",
    type: "percent",
    value: 10,
    scope: "event",
    offerId: null,
    maxUses: null,
    usedCount: 84,
    expiresAt: "2026-09-19T18:00:00Z",
    isActive: true,
    createdAt: "2026-08-01T09:30:00Z",
    updatedAt: "2026-09-06T20:12:00Z",
  },
  {
    id: 3,
    eventId: EVENT_ID,
    code: "VIPTABLE",
    type: "fixed",
    value: 5_000,
    scope: "ticket",
    offerId: 771,
    maxUses: 40,
    usedCount: 12,
    expiresAt: null,
    isActive: true,
    createdAt: "2026-08-14T13:15:00Z",
    updatedAt: "2026-09-05T17:40:00Z",
  },
  {
    id: 4,
    eventId: EVENT_ID,
    code: "PRESS",
    type: "percent",
    value: 100,
    scope: "event",
    offerId: null,
    maxUses: 15,
    usedCount: 9,
    expiresAt: "2026-09-19T21:00:00Z",
    isActive: true,
    createdAt: "2026-09-01T19:45:00Z",
    updatedAt: "2026-09-06T11:02:00Z",
  },
];

/* ------------------------------ Event purse ------------------------------- */

export const mockEventWallet: AdminEventWallet = {
  id: 4101,
  eventId: EVENT_ID,
  userId: 2291,
  ownerName: "Fatou Diallo",
  balance: 1_845_000,
  currency: "XOF",
  isActive: true,
  totalFunded: 3_200_000,
  totalSpent: 1_355_000,
  linkedMomoAccounts: [
    {
      id: 9101,
      number: "+229 97 41 22 08",
      fullName: "Fatou Diallo",
      countryCode: "BJ",
      enabled: true,
      providerName: "MTN Benin",
    },
    {
      id: 9106,
      number: "+229 94 55 21 30",
      fullName: "Ibrahim Sanogo",
      countryCode: "BJ",
      enabled: true,
      providerName: "Moov Africa Benin",
    },
  ],
  movements: [
    {
      id: 1,
      reference: "FJ-EVW-55120",
      direction: "CREDIT",
      amount: 1_200_000,
      fee: 6_000,
      currency: "XOF",
      status: "success",
      narration: "Ticket sales settlement",
      counterparty: "Faajii settlements",
      budgetItemId: null,
      created_at: "2026-09-06T18:24:00Z",
    },
    {
      id: 2,
      reference: "FJ-EVW-55098",
      direction: "DEBIT",
      amount: 640_000,
      fee: 3_200,
      currency: "XOF",
      status: "success",
      narration: "Bar stock — first delivery",
      counterparty: "Beninoise Brasserie",
      budgetItemId: 2,
      created_at: "2026-09-04T09:11:00Z",
    },
    {
      id: 3,
      reference: "FJ-EVW-55071",
      direction: "DEBIT",
      amount: 300_000,
      fee: 1_500,
      currency: "XOF",
      status: "success",
      narration: "Security deposit",
      counterparty: "Atlantic Guards",
      budgetItemId: 3,
      created_at: "2026-08-30T17:45:00Z",
    },
    {
      id: 4,
      reference: "FJ-EVW-55044",
      direction: "CREDIT",
      amount: 2_000_000,
      fee: 10_000,
      currency: "XOF",
      status: "success",
      narration: "Purse top-up from MTN Benin ••08",
      counterparty: "Fatou Diallo",
      budgetItemId: null,
      created_at: "2026-08-12T10:20:00Z",
    },
    {
      id: 5,
      reference: "FJ-EVW-55130",
      direction: "DEBIT",
      amount: 415_000,
      fee: 2_075,
      currency: "XOF",
      status: "pending",
      narration: "Decor — balance due",
      counterparty: "Atelier Lumière",
      budgetItemId: 4,
      created_at: "2026-09-07T08:02:00Z",
    },
  ],
};

/* ------------------------------- Co-planners ------------------------------ */

export const mockEventPlanners: AdminEventPlanner[] = [
  {
    id: 1,
    name: "Ibrahim Sanogo",
    phone: "+229 94 55 21 30",
    status: "accepted",
    permissions: [
      { id: "guests", access: true },
      { id: "tasks", access: true },
      { id: "budget", access: false },
      { id: "wallet", access: false },
      { id: "vendors", access: true },
    ],
    createdAt: "2026-07-14T10:00:00Z",
    invitedBy: { id: 2291, name: "Fatou Diallo", avatar: null },
  },
  {
    id: 2,
    name: "Rachelle Sowe",
    phone: "+229 96 03 77 51",
    status: "accepted",
    permissions: [
      { id: "guests", access: true },
      { id: "tasks", access: true },
      { id: "budget", access: true },
      { id: "wallet", access: false },
    ],
    createdAt: "2026-07-20T09:15:00Z",
    invitedBy: { id: 2291, name: "Fatou Diallo", avatar: null },
  },
  {
    id: 3,
    name: "Marie Kponou",
    phone: "+229 95 22 41 09",
    status: "pending",
    permissions: [{ id: "guests", access: true }],
    createdAt: "2026-09-05T16:40:00Z",
    invitedBy: { id: 2291, name: "Fatou Diallo", avatar: null },
  },
  {
    id: 4,
    name: "Chinedu Okafor",
    phone: "+234 701 998 4412",
    status: "revoked",
    permissions: [],
    createdAt: "2026-08-02T11:00:00Z",
    invitedBy: { id: 2291, name: "Fatou Diallo", avatar: null },
  },
];
