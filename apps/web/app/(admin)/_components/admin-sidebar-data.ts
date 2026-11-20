import {
  BookIcon,
  CardsIcon,
  ChartLineUpIcon,
  ChatTextIcon,
  GearIcon,
  NotebookIcon,
  NotepadIcon,
  UsersIcon,
  type Icon,
} from "@/components/icons";

export type MainNavType = {
  title: string;
  url: string;
  icon: Icon;
};

// Data for the sidebar
export const sidebarData = {
  navMain: [
    {
      title: "Trang chủ",
      url: "/admin",
      icon: ChartLineUpIcon,
    },
    {
      title: "Chủ đề",
      url: "/admin/topics",
      icon: NotebookIcon,
    },
    {
      title: "Thẻ từ vựng",
      url: "/admin/flashcards",
      icon: CardsIcon,
    },
    {
      title: "Thẻ câu",
      url: "/admin/sentences",
      icon: ChatTextIcon,
    },
    {
      title: "Bài luyện tập",
      url: "/admin/lessons",
      icon: BookIcon,
    },
    {
      title: "Câu hỏi luyện tập",
      url: "/admin/exercises",
      icon: NotepadIcon,
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
