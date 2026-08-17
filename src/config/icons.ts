/**
 * Semantic icon map.
 *
 * The admin draws from `iconsax-reactjs`, the web sibling of the
 * `iconsax-react-nativejs` set the mobile app uses, so the two products share an
 * icon language. Importing through this map (rather than reaching into the
 * package per-file) keeps a concept like "wallet" pinned to one glyph
 * everywhere, and makes a swap a single edit.
 */
export type { IconProps, Icon } from "iconsax-reactjs";

export {
  // Navigation
  Category2 as IconDashboard,
  Profile2User as IconUsers,
  UserOctagon as IconHostProfile,
  Shop as IconVendors,
  Calendar as IconEvents,
  Ticket2 as IconPurchases,
  Box1 as IconOrders,
  Element3 as IconWristbands,
  Gift as IconGiftLinks,
  ArrangeHorizontal as IconTransactions,
  Receipt21 as IconReconciliation,
  Wallet3 as IconWallets,
  EmptyWallet as IconMomo,
  VideoPlay as IconVibes,
  NotificationBing as IconNotifications,
  MessageQuestion as IconSupport,
  Cloud as IconIntegrations,
  Setting2 as IconTeamSettings,
  Logout as IconLogout,

  // Table & filter chrome
  SearchNormal1 as IconSearch,
  Filter as IconFilter,
  Sort as IconSort,
  Add as IconAdd,
  DocumentDownload as IconDownload,
  Refresh2 as IconRefresh,
  More as IconMore,

  // Form fields
  Sms as IconEmail,
  Lock1 as IconPassword,
  Call as IconPhone,
  Eye as IconEye,
  EyeSlash as IconEyeSlash,
  Link21 as IconLink,
  Location as IconLocation,
  Global as IconWebsite,
  Money as IconAmount,
  Text as IconText,

  // Status & feedback
  InfoCircle as IconInfo,
  TickCircle as IconSuccess,
  TickSquare as IconCheck,
  Warning2 as IconWarning,
  Danger as IconDanger,
  CloseCircle as IconError,
  CloseCircle as IconClose,
  Trash as IconTrash,
  Edit2 as IconEdit,
  Copy as IconCopy,
  DocumentText as IconDocument,
  Star1 as IconStar,

  // Money direction — credit lands, debit leaves.
  MoneyRecive as IconCredit,
  MoneySend as IconDebit,

  // Dates
  Calendar as IconCalendar,
  CalendarTick as IconCalendarTick,

  // Moderation & engagement
  Flag as IconFlag,
  Heart as IconLike,
  Message2 as IconComment,
  Share as IconShare,
  Play as IconPlay,
  Slash as IconDisable,

  // Empty states — a glyph that names what is missing beats a generic
  // illustration, so each section supplies its own.
  Archive as IconInbox,
  SearchStatus1 as IconNoResults,
  CalendarRemove as IconNoEvents,
  ProfileDelete as IconNoUsers,
  NoteRemove as IconNoRecords,
  Coin1 as IconNoTransactions,
  EmptyWalletTime as IconNoWallet,
  TicketDiscount as IconNoTickets,
  Grid6 as IconNoContent,
  Task as IconNoTasks,
  Award as IconNoSponsors,
  Personalcard as IconNoProfiles,
  Send2 as IconNoMessages,

  // Directional
  ArrowLeft2 as IconArrowLeft,
  ArrowRight2 as IconArrowRight,
  ArrowDown2 as IconChevronDown,
  ArrowUp2 as IconChevronUp,
  ArrowUp as IconArrowUp,
  ArrowDown as IconArrowDown,
} from "iconsax-reactjs";
