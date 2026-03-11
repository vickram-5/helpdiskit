export type AppRole = "admin" | "technician" | "manager" | "system_admin" | "network_engineer" | "it_team_lead" | "it_manager" | "it_head";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  technician: "Technician",
  manager: "Manager",
  system_admin: "System Admin",
  network_engineer: "Network Engineer",
  it_team_lead: "IT Team Lead",
  it_manager: "IT Manager",
  it_head: "IT Head",
};

export const ROLE_ICONS: Record<AppRole, string> = {
  admin: "⚙️",
  technician: "🔧",
  manager: "👔",
  system_admin: "🖥️",
  network_engineer: "🌐",
  it_team_lead: "👨‍💼",
  it_manager: "📊",
  it_head: "🏢",
};

export const canViewAllTickets = (role: AppRole | null): boolean =>
  !!role && ["admin", "it_team_lead", "it_manager", "it_head", "manager"].includes(role);

export const canManageUsers = (role: AppRole | null): boolean =>
  !!role && ["admin"].includes(role);

export const canManageAssets = (role: AppRole | null): boolean =>
  !!role && ["admin", "it_team_lead", "it_manager", "it_head"].includes(role);

export const canRaiseTicket = (role: AppRole | null): boolean =>
  !!role && role !== "admin";

export const canViewLeaderboard = (role: AppRole | null): boolean =>
  !!role && ["admin", "it_team_lead", "it_manager", "it_head", "manager"].includes(role);
