export interface UsersData {
  id: number;
  userId: string;
  ref: string;
  email: string;
  phoneNumber: string;
  avatar: string | null;
  status: string;
  name: string | null;
  totalEvents: number;
  activeEvents: number;
}

interface UserProfile {
  id: number;
  email: string;
  phoneNumber: string;
  bio: string | null;
  avatar: string | null;
  partyPlanningVibe: string | null;
  status: string;
  name: string | null;
  created_at: string;
}

interface Wallet {
  ref: string;
  partyBankName: string;
}

interface RecentTransaction {
  ref: string;
  transactionId: number;
  transactionRef: string;
  reference: string;
  transactionAmount: number;
  narration: string;
  direction: "DEBIT" | "CREDIT";
  transactionStatus: string;
  created_at: string;
  wallet: Wallet;
}

export interface SingleUserData {
  userProfile: UserProfile;
  recentTransaction: RecentTransaction[];
}

export interface UserQuickStats {
  EventsCreated: number;
  eventsCoPlanned: number;
  rsvpEvents: number;
  totalAmountSpent: string;
  giftsGiven: number;
  giftsReceived: number;
}

export interface UserActivity {
  id: number;
  title: string;
  message: string;
  userId: number;
  eventId: number;
  eventName: string;
  performerName: string;
  performerRole: string;
  activityType: string;
  metaData: {
    tag: string;
    actor: {
      name: string;
      imageUrl: string;
    };
  };
  created_at: string;
  updated_at: string;
  ref: string | null;
}
