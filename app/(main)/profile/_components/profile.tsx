"use client";

import { logout } from "@/actions/auth/logout";
import { User as UserType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Crown,
  Flame,
  LogOutIcon,
  Mail,
  Settings,
  Star,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { redirect } from "next/navigation";

interface ProfileProps {
  profile: UserType;
}

export default function Profile({ profile }: ProfileProps) {
  // Calculate level from XP (assuming 100 XP per level)
  const level = Math.floor(profile.xp / 100) + 1;
  const currentLevelXP = profile.xp % 100;
  const xpProgress = (currentLevelXP / 100) * 100;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {level}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="icon"
                    className="self-start sm:self-center"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-start sm:self-center"
                    onClick={async () => {
                      await logout();
                      redirect("/login");
                    }}
                  >
                    <LogOutIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* XP Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {currentLevelXP}/100 Kinh nghiệm
                  </span>
                </div>
                <Progress value={xpProgress} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gamification Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Thống kê học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-full">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {profile.xp.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tổng kinh nghiệm
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-full">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {profile.streakDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Streaks</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-500 rounded-full">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {profile._count.attempts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Số bài đã luyện
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-500 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {profile._count.xpLogs}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Nhật ký kinh nghiệm
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Tổng quan hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Trạng thái tài khoản</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {profile.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Nhật ký chuỗi ngày</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {profile._count.streakLogs} mục
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Thành viên từ</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Thông tin hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Vai trò
                  </label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                      {profile.role}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày sinh
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {profile.dob ? formatDate(profile.dob) : "Chưa thiết lập"}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Giới tính
                  </label>
                  <div className="mt-1 text-sm font-medium capitalize">
                    {profile.gender || "Chưa xác định"}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cập nhật lần cuối
                  </label>
                  <div className="mt-1 text-sm">
                    {formatDate(profile.updatedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondaryOutline"
                className="w-full justify-start"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Xem thành tích
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Lịch sử học tập
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
