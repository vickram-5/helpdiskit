export const DEPARTMENTS = [
  "Inbound Customer Support",
  "Outbound / Telecalling",
  "Data Management & Entry",
  "Quality & Training",
  "Administration",
  "IT Support",
];

export const ISSUE_CATEGORIES: Record<string, string[]> = {
  "Assistive Technology": [
    "Screen Reader (JAWS/NVDA) Crash",
    "Braille Display / Keyboard Issue",
    "Accessibility Software License",
    "Other",
  ],
  "Voice & Dialer Setup": [
    "Headset/Audio Issue",
    "Dialer Login Failed",
    "Call Drop / Latency",
    "Other",
  ],
  "Data Management & Security": [
    "Client Portal/VPN Access",
    "Data Entry Tool Lag",
    "Account Lockout",
    "Other",
  ],
  Hardware: ["Laptop Issue", "Monitor", "Keyboard/Mouse", "Printer", "Other"],
  Software: ["OS Issue", "Application Error", "Installation", "Update", "Other"],
  Network: ["Internet", "VPN", "Wi-Fi", "LAN", "Other"],
  Access: ["Password Reset", "Account Unlock", "Permission Request", "New Account", "Other"],
  Other: [],
};

export const PRIORITIES = [
  { value: "Low", label: "🟢 Low" },
  { value: "Medium", label: "🟡 Medium" },
  { value: "High", label: "🔴 High" },
  { value: "Critical", label: "🟣 Critical" },
] as const;
