# Admin ↔ backend gaps

Every route below was probed against the staging API the mobile app also points
at (`https://faajiii-backend-staging-344535634654.up.railway.app/v1`). An
unauthenticated request returning **401** means the route exists; **404** means
it is not served. The probe was validated against known-good routes first
(`/v1/user/me` → 401, `/v1/home/feed` → 200, a nonsense path → 404).

The admin renders a `PendingBackend` notice — naming the exact routes — wherever
a module's endpoints answer 404, so an unfinished integration reads as "awaiting
backend" rather than a broken page.

## 1. Built admin modules the backend does not serve

These screens exist and are wired up; they light up the moment the routes land.

### Reconciliation (`/payment-tracking`)

```
GET   /admin/payment-tracking
GET   /admin/payment-tracking/stats
GET   /admin/payment-tracking/:id
POST  /admin/payment-tracking/:reference/confirm
POST  /admin/payment-tracking/:reference/assign-ticket
POST  /admin/payment-tracking/:reference/escalate
POST  /admin/payment-tracking/:id/resend-rsvp
POST  /admin/payment-tracking/:id/resend-webhook
POST  /admin/payment-tracking/:id/waive-and-resend
```

### Order tracking (`/order-management`)

```
GET   /admin/order-management
PATCH /admin/gift-orders/:id/status
```

### Team & roles (`/team-settings`)

The Administrators tab works (`/admin/all/admins-list` is live). Roles,
permissions, the audit log and invites are not:

```
GET    /admin/roles
POST   /admin/roles
PUT    /admin/roles/:id
DELETE /admin/roles/:id
PUT    /admin/roles/:id/permissions
GET    /admin/permissions
PUT    /admin/:adminId/change-role
POST   /admin/invite
GET    /admin/audit-logs
```

### Individual actions on otherwise-working screens

```
PUT   /admin/vendors/:id/approve      # /admin/vendors/:id/toggle-status works
PUT   /admin/vendors/:id/reject
GET   /admin/guests/:id               # event guest detail / edit
PUT   /admin/guests/:id
DELETE /admin/guests/:id/remove
POST  /admin/guests/:id/resend-rsvp
POST  /admin/guests/add-ticket
POST  /admin/transaction/:sessionId/verify
POST  /admin/transaction/:sessionId/complete
POST  /admin/reset-password
POST  /tooling/reset-pin/:id          # user PIN reset
GET   /admin/wishlist/items/:id
GET   /partybank/admin/event/:id/transactions
```

## 2. New admin coverage for existing mobile features

The data already exists — the mobile app reads it under the event owner's own
token. What is missing is an admin-scoped view. Routes follow the convention
already used by the live `/admin/events/:id/guests`, `/tickets`, `/planners`,
`/vendors` and `/party-store`.

### Event operations — tabs on `/event-management/:id`

| Tab | Mobile source | Admin route needed |
| --- | --- | --- |
| Check-ins | `POST /v1/event/:id/guests/check-in` | `GET /admin/events/:id/check-ins`<br>`GET /admin/events/:id/check-ins/summary`<br>`PATCH /admin/events/:id/check-ins/:guestId` |
| Budget | `GET /v1/budget/event/:id` | `GET /admin/events/:id/budget` |
| Tasks | `GET /v1/task-tracker/` | `GET /admin/events/:id/tasks` |
| Sponsors | `GET /v1/event/:id/sponsors` | `GET /admin/events/:id/sponsors`<br>`DELETE /admin/events/:id/sponsors/:sponsorId` |
| Discount codes | `GET /v1/events/:id/discount-codes` | `GET /admin/events/:id/discount-codes`<br>`PATCH /admin/events/:id/discount-codes/:codeId` |
| Event purse | `POST /v1/event/:id/wallet/fund`, `/wallet/send` | `GET /admin/events/:id/wallet` |
| Co-planners | `GET /v1/event/:id/co-planners` | `DELETE /admin/events/:id/planners/:coPlannerId` (list already live) |

### Host profiles (`/host-profiles`)

The mobile `HostProfile` record already carries `approvalStatus`, `approvedBy`
and `rejectionReason` — the approval queue was always meant to live here.

```
GET   /admin/host-profiles
GET   /admin/host-profiles/statistics
GET   /admin/host-profiles/:id
PATCH /admin/host-profiles/:id/approve
PATCH /admin/host-profiles/:id/reject
```

### Finance (`/wallets`, `/momo-accounts`)

```
GET   /admin/wallets
GET   /admin/wallets/summary
GET   /admin/momo/accounts
PATCH /admin/momo/accounts/:id
```

`GET /v1/momo/providers` is already public and is reused directly for the
provider filter, so the admin dropdown cannot drift from what the app offers.

### Notifications (`/notifications`)

The app registers FCM tokens via `/v1/notifications/register-token`; the admin
needs the other half — reach and broadcast.

```
GET   /admin/notifications/broadcasts
POST  /admin/notifications/broadcasts
PATCH /admin/notifications/broadcasts/:id/cancel
GET   /admin/notifications/devices
GET   /admin/notifications/devices/statistics
```

### Support (`/support`)

"Contact support" in the app is currently a set of outbound links (phone, email,
socials) with no backing store. This needs a ticket model, not just an admin
route.

```
GET   /admin/support/tickets
GET   /admin/support/tickets/:id
POST  /admin/support/tickets/:id/messages
PATCH /admin/support/tickets/:id
GET   /admin/support/statistics
```

### Gift links (`/gift-links`)

⚠️ **The weakest of these.** In `faajii-mobile-core` gift links are entirely
device-local — `src/modules/giftlinks/services/giftLinksStore.ts` persists to
AsyncStorage and seeds sample well-wishers, with a comment to "replace with real
contributions when the backend lands". There is no user-facing endpoint either,
so this needs the whole feature built server-side before admin visibility means
anything.

```
GET   /admin/gift-links
GET   /admin/gift-links/:id
PATCH /admin/gift-links/:id/status
```

## 3. Removed

Legacy PartyBank/PartyVest commerce — absent from the mobile app's current
modules (they survive only under the old `src/pv-data` tree) and 404 on every
endpoint:

- Pages: `/drinks`, `/gift-shop`, `/party-bundles`, `/admin`, event Wishlist tab
- Services: `drinks`, `gift-shop`, `party-bundle`, `product`
- Endpoints confirmed dead: `/admin/drinkstore/items`, `/admin/drinks/brands`,
  `/admin/drink-store/quickstats`, `/admin/gift-store/quickstats`,
  `/product/gift-store/items`, `/wishbasket/sales`, `/partybundle`,
  `/admin/partybundle/overview`

Party Store was **kept** — `/admin/partystore/items/:id` and
`/admin/events/:id/party-store` are live, and the app has an active
`partyShopApi` / Faajii Store screen.

## 4. Known lint debt after the Next 16 upgrade

`next build` passes and does not run ESLint. `yarn lint` reports 15 errors, all
in pre-existing files and all from rules that ship new with Next 16's
`react-hooks` plugin (`set-state-in-effect`, `purity`, `immutability`). They are
the classic "sync state from a prop inside `useEffect`" pattern:

```
src/app/(auth)/sign-in/page.tsx                          purity
src/app/(dashboard)/order-management/page.tsx            set-state-in-effect
src/app/(dashboard)/user-management/[id]/page.tsx        set-state-in-effect
src/app/(dashboard)/vendor-management/page.tsx           set-state-in-effect
src/app/(dashboard)/vendor-management/[id]/page.tsx      set-state-in-effect ×2
src/app/(dashboard)/vendor-management/pending/[id]/page.tsx
src/app/(dashboard)/vendor-management/rejected/[id]/page.tsx
src/components/blocks/team-setting/RolesPermissions.tsx
src/components/elements/date-filter/index.tsx
src/components/elements/modals/EditUserModal.tsx
src/components/elements/modals/OrderDetailsModal.tsx     set-state-in-effect ×2
src/components/elements/modals/OrderStatusModal.tsx      set-state-in-effect, immutability
```

These were left as-is rather than muted: fixing them means reworking state-sync
logic in screens that need a live backend to verify, which is a separate change
from a version bump.
