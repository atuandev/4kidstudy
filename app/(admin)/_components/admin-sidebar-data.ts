import {
  BookAIcon,
  ChartNoAxesCombinedIcon,
  LibraryIcon,
  LibrarySquareIcon,
  LucideIcon,
  NotebookIcon,
  NotebookTextIcon,
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
    {
      title: 'Thẻ từ vựng',
      url: '/admin/flashcards',
      icon: LibraryIcon,
    },
    // {
    //   title: 'Thẻ câu',
    //   url: '/admin/sentences',
    //   icon: LibrarySquareIcon,
    // },
    {
      title: "Bài luyện tập",
      url: "/admin/lessons",
      icon: BookAIcon,
    },
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
