

# Comprehensive IT Ticketing Tool Upgrade Plan

This is a significant full-stack update spanning database schema changes, new roles, a new Asset Management module, updated forms with BPO-specific cascading dropdowns, dashboard enhancements, and accessibility improvements. Given the scope, this will be implemented in phases.

---

## Phase 1: Database Schema Changes

### 1a. Expand Roles Enum
Add new roles to the `app_role` enum: `system_admin`, `network_engineer`, `it_team_lead`, `it_manager`, `it_head`.

```sql
ALTER TYPE public.app_role ADD VALUE 'system_admin';
ALTER TYPE public.app_role ADD VALUE 'network_engineer';
ALTER TYPE public.app_role ADD VALUE 'it_team_lead';
ALTER TYPE public.app_role ADD VALUE 'it_manager';
ALTER TYPE public.app_role ADD VALUE 'it_head';
```

### 1b. Add New Columns to Tickets Table
Add `department`, `location`, `asset_id` columns. Remove reliance on `process` / `reported_by` fields (keep them nullable for backwards compat but hide from UI).

```sql
ALTER TABLE public.tickets ADD COLUMN department text DEFAULT '';
ALTER TABLE public.tickets ADD COLUMN location text DEFAULT '';
ALTER TABLE public.tickets ADD COLUMN asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL;
```

Update the `priority` default and add "Critical" as a valid value (already text column, no constraint needed).

### 1c. Create Assets Table

```sql
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL UNIQUE,
  asset_type text NOT NULL,
  serial_number text DEFAULT '',
  assigned_user text DEFAULT '',
  status text NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assets
CREATE POLICY "Authenticated users can view assets" ON public.assets
  FOR SELECT TO authenticated USING (true);

-- Admins/leads/managers full access
CREATE POLICY "Admins full access to assets" ON public.assets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'it_team_lead') OR has_role(auth.uid(), 'it_manager') OR has_role(auth.uid(), 'it_head'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'it_team_lead') OR has_role(auth.uid(), 'it_manager') OR has_role(auth.uid(), 'it_head'));
```

### 1d. Update RLS Policies
Add policies so `it_team_lead`, `it_manager`, `it_head` can view all tickets (for team performance metrics).

---

## Phase 2: Frontend — Role & Auth Updates

### Files affected: `src/hooks/useAuth.tsx`, `src/components/AppSidebar.tsx`, `src/pages/Index.tsx`

- Expand the `role` type to include all 7 roles.
- Create role permission helpers: `canViewAllTickets(role)`, `canManageUsers(role)`, `canManageAssets(role)`.
- Update sidebar navigation to show/hide items based on role:
  - **Admin/IT Head/IT Manager**: Full access including User Management, Assets, Leaderboard.
  - **IT Team Lead**: Can see team performance, all tickets, assets.
  - **Technician/System Admin/Network Engineer**: Raise Ticket, My History, Assets (view-only).

---

## Phase 3: Vindhya BPO-Specific Form Updates

### File: `src/components/TicketForm.tsx`

Replace the current `ISSUE_CATEGORIES` with BPO-specific cascading categories:

```typescript
const ISSUE_CATEGORIES: Record<string, string[]> = {
  "Assistive Technology": [
    "Screen Reader (JAWS/NVDA) Crash",
    "Braille Display / Keyboard Issue",
    "Accessibility Software License",
    "Other"
  ],
  "Voice & Dialer Setup": [
    "Headset/Audio Issue",
    "Dialer Login Failed",
    "Call Drop / Latency",
    "Other"
  ],
  "Data Management & Security": [
    "Client Portal/VPN Access",
    "Data Entry Tool Lag",
    "Account Lockout",
    "Other"
  ],
  Hardware: ["Laptop Issue", "Monitor", "Keyboard/Mouse", "Printer", "Other"],
  Software: ["OS Issue", "Application Error", "Installation", "Update", "Other"],
  Network: ["Internet", "VPN", "Wi-Fi", "LAN", "Other"],
  Access: ["Password Reset", "Account Unlock", "Permission Request", "New Account", "Other"],
  Other: [],
};
```

Add new fields to the form:
- **Department** dropdown: 6 BPO departments.
- **Location** text input.
- **Asset** dropdown: pulls from assets table.
- **Priority**: Add "Critical" option with 🟣 icon.
- **Remove**: `process` and `reported_by` fields from UI.

Add proper `aria-label` attributes to all form inputs, selects, and buttons.

---

## Phase 4: Dashboard Enhancements

### File: `src/components/AdminDashboard.tsx`

- **Technician Performance Leaderboard**: Rank technicians by tickets resolved this month. Show as a sorted list with bar visualization.
- **Open Tickets by Priority chart**: Horizontal bar chart filtering only open tickets by priority (Low/Medium/High/Critical).
- **Monthly auto-reset**: Already implemented (filters by current month). Verify and ensure technician dashboard counters also filter by current month.

---

## Phase 5: Asset Management Module

### New files:
- `src/components/AssetManagement.tsx` — Full CRUD table for assets.
- `src/lib/assets.ts` — Data access layer for assets.

### Features:
- Table view with search/filter by type and status.
- Add/Edit/Delete asset dialogs (admin/lead/manager only).
- Asset types dropdown: Desktop/Thin Client, Headset, Braille Keyboard, Specialized Ergonomics, IP Phone.
- Status options: Available, Assigned, Under Repair, Decommissioned.
- Add "Assets" nav item to sidebar with `Monitor` icon.

---

## Phase 6: Accessibility (a11y) Improvements

### Across all components:
- Add `aria-label` to every `<Input>`, `<Select>`, `<Button>`, `<Textarea>`.
- Add `role="form"` to forms, `role="navigation"` to sidebar.
- Ensure all interactive elements are focusable via Tab.
- Add `aria-current="page"` to active sidebar item.
- Ensure glass container text maintains WCAG AA contrast (already using dark text on light glass — will verify and adjust `text-foreground` if needed).
- Add `id` + `htmlFor` pairing on all `<label>` elements for screen reader association.

---

## Phase 7: Mobile Responsiveness Fixes

### Files: `src/pages/Index.tsx`, `src/components/AdminDashboard.tsx`, `src/components/TicketTable.tsx`

- Sidebar already uses hamburger menu on mobile (verified in AppSidebar).
- Dashboard stat cards: Already `grid-cols-2` on mobile. Will ensure 2x2 grid.
- Charts: Ensure `ResponsiveContainer` widths work on small screens.
- TicketTable: Already has `overflow-x-auto`. Will add horizontal scroll hint.
- Header: Already uses `flex-wrap`. Verify no overlap on narrow screens.

---

## Phase 8: Edge Function Updates

### File: `supabase/functions/manage-users/index.ts`
- Update role dropdown values to include all 7 new roles.
- Validate role values server-side against the expanded enum.

### File: `supabase/config.toml`
- Remove the `[functions.bootstrap-admin]` section (function was deleted).

---

## Execution Order
1. Database migration (roles enum + assets table + ticket columns)
2. Update `manage-users` edge function for new roles
3. Update `useAuth.tsx` with expanded role types
4. Update `TicketForm.tsx` with BPO dropdowns, department, location, asset, a11y
5. Update `AdminDashboard.tsx` with leaderboard + priority chart
6. Create `AssetManagement.tsx` + `assets.ts`
7. Update `AppSidebar.tsx` + `Index.tsx` with new nav items and role-based visibility
8. Update `EditTicketDialog.tsx` with Critical priority + new fields
9. Update `TicketTable.tsx` with new columns (Department, Location)
10. Apply a11y attributes across all components
11. Update `Login.tsx` with a11y labels

This preserves existing auth, routing, and the React/Tailwind/Vite structure. No breaking changes to current data — new columns use defaults.

