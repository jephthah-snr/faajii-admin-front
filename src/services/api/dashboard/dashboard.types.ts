interface PercentageStat {
  percentageIncrease: string | number;
}

interface ActiveUsers extends PercentageStat {
  users: number;
}

interface NewSignups extends PercentageStat {
  users: number;
}

interface AppDownloads extends PercentageStat {
  downloads: number;
}

interface Vendors extends PercentageStat {
  activeVendors: number;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: ActiveUsers;
  newSignups: NewSignups;
  appDownloads: AppDownloads;
  vendors: Vendors;
}

// Chart data
interface ChartDataPoint {
  month: string;
  totalUsers: number;
}

export type ChartData = ChartDataPoint[];

/* Sub stats */
interface Stats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  pendingEvents: number;
}

interface DrinkStats {
  totalOrders: number;
  paidAndCompletedOrders: number;
  failedOrders: number;
}

interface GiftStats {
  paidAndCompletedOrders: number;
  failedOrders: number;
}

interface VendorStats {
  numberOfVendors: number;
  activeVendors: number;
  flaggedVendors: number;
}

export interface SubStatsData {
  stats: Stats;
  drinkStats: DrinkStats;
  giftStats: GiftStats;
  vendorStats: VendorStats;
}
