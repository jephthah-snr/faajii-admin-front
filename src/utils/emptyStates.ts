import {
  IconNoContent,
  IconNoEvents,
  IconNoMessages,
  IconNoProfiles,
  IconNoRecords,
  IconNoResults,
  IconNoTickets,
  IconNoTransactions,
  IconNoUsers,
  IconNoWallet,
  IconOrders,
  IconVendors,
  IconWristbands,
  type Icon,
} from "@/config/icons";

export interface EmptyStatePreset {
  title: string;
  description: string;
  icon: Icon;
}

/**
 * One preset per section, each with a glyph that names what's missing. Pages
 * spread these into `EmptyState` so the same absence always reads the same way.
 */

export const transactionEmptyState: EmptyStatePreset = {
  title: "No transactions yet",
  description: "Money moving through Faajii will be listed here.",
  icon: IconNoTransactions,
};

export const userEmptyState: EmptyStatePreset = {
  title: "No users yet",
  description: "People who sign up for Faajii will appear here.",
  icon: IconNoUsers,
};

export const eventEmptyState: EmptyStatePreset = {
  title: "No events yet",
  description: "Events created in the app will show up here.",
  icon: IconNoEvents,
};

export const orderEmptyState: EmptyStatePreset = {
  title: "No orders yet",
  description: "Orders placed by customers will land here.",
  icon: IconOrders,
};

export const purchaseEmptyState: EmptyStatePreset = {
  title: "No ticket purchases",
  description: "Tickets bought through the app will be listed here.",
  icon: IconNoTickets,
};

export const vendorEmptyState: EmptyStatePreset = {
  title: "No vendors yet",
  description: "Vendors who register on Faajii will appear here.",
  icon: IconVendors,
};

export const vibeEmptyState: EmptyStatePreset = {
  title: "No vibes to review",
  description: "Photos and videos posted to events will show up here.",
  icon: IconNoContent,
};

export const wristbandEmptyState: EmptyStatePreset = {
  title: "No wristband orders",
  description: "Custom wristband orders will be listed here.",
  icon: IconWristbands,
};

export const hostProfileEmptyState: EmptyStatePreset = {
  title: "Nothing to review",
  description: "Host profiles matching this filter will show up here.",
  icon: IconNoProfiles,
};

export const walletEmptyState: EmptyStatePreset = {
  title: "No wallets yet",
  description:
    "Wallets appear once users fund an account or open an event purse.",
  icon: IconNoWallet,
};

export const adminEmptyState: EmptyStatePreset = {
  title: "No team members yet",
  description: "Invite an admin to give them access to this dashboard.",
  icon: IconNoUsers,
};

export const paymentTrackingEmptyState: EmptyStatePreset = {
  title: "Nothing to reconcile",
  description: "Payments needing attention will be queued here.",
  icon: IconNoRecords,
};

export const supportEmptyState: EmptyStatePreset = {
  title: "Nothing in the queue",
  description: "Support requests raised from the app will land here.",
  icon: IconNoMessages,
};

export const searchEmptyState: EmptyStatePreset = {
  title: "No matches",
  description: "Try a different search term or clear your filters.",
  icon: IconNoResults,
};
