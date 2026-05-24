import { BarChart3, ClipboardCheck, PlusCircle, Settings, Shield } from "lucide-react";

export const marketingNavigation = [
  { label: "Features", href: "/#features" },
  { label: "Example", href: "/#example" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const appNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "New evaluation", href: "/evaluations/new", icon: PlusCircle },
  { label: "History", href: "/evaluations", icon: ClipboardCheck },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export const adminNavigation = [{ label: "Admin", href: "/admin", icon: Shield }] as const;
