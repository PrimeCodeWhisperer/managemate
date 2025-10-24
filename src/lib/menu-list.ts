import {
  Tag,
  Users,
  Settings,
  LayoutGrid,
  LucideIcon,
  Calendar,
  Clock,
  Palmtree,
  CheckCheck
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Actions",
      menus: [
        {
          href: "/schedule",
          label: "Schedule",
          active: pathname.includes("/schedule"),
          icon: Calendar,
          submenus: []
        },
        {
          href: "/approval",
          label: "Shift Approval",
          active: pathname.includes("/approval"),
          icon: CheckCheck,
          submenus: []
        },
        {
          href: "/timesheet",
          label: "Timesheet",
          active: pathname.includes("/timesheet"),
          icon: Clock,
          submenus: []
        },
        {
          href: "/vacations",
          label: "Vacations",
          active: pathname.includes("/vacations"),
          icon: Palmtree,
          submenus: []
        },
        {
          href: "/employees",
          label: "Employees",
          active: pathname.includes("/employees"),
          icon: Users,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings,
          submenus: []
        }
      ]
    }
  ];
}
