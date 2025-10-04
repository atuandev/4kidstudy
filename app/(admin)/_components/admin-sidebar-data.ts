import {
  BookAIcon,
  ChartNoAxesCombinedIcon,
  LucideIcon,
  NotebookIcon,
  NotebookTextIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

export type MainNavType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

// Data for the sidebar
export const sidebarData = {
  navMain: [
    {
      title: "Trang chủ",
      url: "/admin",
      icon: ChartNoAxesCombinedIcon,
    },
    {
      title: "Units",
      url: "/admin/topics",
      icon: NotebookIcon,
    },
    // {
    //   title: 'Bài học',
    //   url: '/admin/lessons',
    //   icon: BookAIcon,
    // },
    {
      title: "Câu hỏi",
      url: "/admin/exercises",
      icon: NotebookTextIcon,
    },
    {
      title: "Người dùng",
      url: "/admin/users",
      icon: UsersIcon,
    },
    // {
    //   title: 'Cài đặt',
    //   url: '/admin/settings',
    //   icon: SettingsIcon,
    // },
  ] as MainNavType[],
};
