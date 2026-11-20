"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookIcon,
  CardsIcon,
  ChatTextIcon,
  NotebookIcon,
  NotepadIcon,
  UsersIcon,
} from "@/components/icons";
import Link from "next/link";

interface DashboardStatsProps {
  totalLessons: number;
  totalExercises: number;
  totalTopics: number;
  totalUsers: number;
  totalFlashcards: number;
  totalSentenceImages: number;
}

export function DashboardStats({
  totalLessons,
  totalExercises,
  totalTopics,
  totalUsers,
  totalFlashcards,
  totalSentenceImages,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Chủ đề",
      value: totalTopics,
      icon: NotebookIcon,
      description: "Tất cả chủ đề",
      color: "text-purple-600",
      url: "/admin/topics",
    },
    {
      title: "Thẻ từ vựng",
      value: totalFlashcards,
      icon: CardsIcon,
      description: "Tất cả thẻ từ vựng",
      color: "text-pink-600",
      url: "/admin/flashcards",
    },
    {
      title: "Thẻ câu",
      value: totalSentenceImages,
      icon: ChatTextIcon,
      description: "Tất cả thẻ câu",
      color: "text-cyan-600",
      url: "/admin/sentences",
    },
    {
      title: "Bài luyện tập",
      value: totalLessons,
      icon: BookIcon,
      description: "Tất cả bài luyện tập",
      color: "text-blue-600",
      url: "/admin/lessons",
    },
    {
      title: "Câu hỏi luyện tập",
      value: totalExercises,
      icon: NotepadIcon,
      description: "Tất cả câu hỏi luyện tập",
      color: "text-green-600",
      url: "/admin/exercises",
    },
    {
      title: "Người dùng",
      value: totalUsers,
      icon: UsersIcon,
      description: "Người dùng đăng ký",
      color: "text-orange-600",
      url: "/admin/users",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Link key={stat.title} href={stat.url}>
          <Card className="cursor-pointer hover:bg-muted">
            <CardHeader className="flex items-center gap-2">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <CardTitle className="text-lg font-bold">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
