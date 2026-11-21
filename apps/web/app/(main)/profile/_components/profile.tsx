"use client";

import { logout } from "@/actions/auth/logout";
import { PageHeading } from "@/components/page-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GRADE_LABELS, GradeValue, User as UserType } from "@/types";
import { FireIcon, KeyIcon, SignOutIcon, TrophyIcon, UserIcon } from "@/components/icons";
import { useState } from "react";
import { UpdateProfileDialog } from "./update-profile";
import { ChangePasswordDialog } from "./change-password";

interface ProfileProps {
  profile: UserType;
}

export default function Profile({ profile }: ProfileProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const level = Math.floor(profile.xp / 100) + 1;
  const currentLevelXP = profile.xp % 100;
  const xpProgress = (currentLevelXP / 100) * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const genderLabel =
    profile.gender === "MALE" ? "Nam" : profile.gender === "FEMALE" ? "Nữ" : "Chưa xác định";

  const details: { label: string; value: React.ReactNode }[] = [
    { label: "Khối học", value: GRADE_LABELS[profile.grade as GradeValue] },
    { label: "Ngày sinh", value: profile.dob ? formatDate(profile.dob) : "Chưa thiết lập" },
    { label: "Giới tính", value: genderLabel },
    {
      label: "Trạng thái tài khoản",
      value: (
        <span
          className={
            profile.isActive
              ? "rounded-full bg-leaf-wash px-2.5 py-0.5 text-sm font-extrabold text-forest"
              : "rounded-full bg-cherry-wash px-2.5 py-0.5 text-sm font-extrabold text-cherry-deep"
          }
        >
          {profile.isActive ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    { label: "Thành viên từ", value: formatDate(profile.createdAt) },
    { label: "Cập nhật lần cuối", value: formatDate(profile.updatedAt) },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeading title="Hồ sơ của bé" echo="Your profile" />
      <section className="rounded-[28px] bg-white p-5 shadow-sheet-lime sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative w-fit">
            <Avatar className="size-24 -rotate-3 border-[5px] border-white shadow-sticker">
              <AvatarImage src={profile.avatarUrl} alt="" />
              <AvatarFallback className="bg-leaf-deep text-2xl font-black text-white">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-3 rounded-full bg-sun px-2.5 py-0.5 text-sm font-black text-ink shadow-[0_3px_0_#B78A00]">
              Cấp {level}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-3xl font-black text-ink">{profile.name}</h2>
            <p className="truncate text-base font-bold text-ink-body">{profile.email}</p>

            <div className="mt-3">
              <p className="flex justify-between text-sm font-extrabold text-ink-body">
                <span>Lên cấp {level + 1}</span>
                <span className="tabular-nums text-ink">{currentLevelXP}/100 XP</span>
              </p>
              <div
                role="progressbar"
                aria-label={`Kinh nghiệm để lên cấp ${level + 1}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={currentLevelXP}
                className="mt-1.5 h-3 overflow-hidden rounded-full bg-wash"
              >
                <div className="h-full rounded-full bg-leaf" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-wash pt-5">
          <Button size="lg" onClick={() => setIsUpdateDialogOpen(true)}>
            <UserIcon aria-hidden="true" />
            Sửa hồ sơ
          </Button>
          <Button size="lg" onClick={() => setIsChangePasswordDialogOpen(true)}>
            <KeyIcon aria-hidden="true" />
            Đổi mật khẩu
          </Button>
          <Button
            size="lg"
            variant="dangerOutline"
            className="sm:ml-auto"
            onClick={() => {
              void logout();
            }}
          >
            <SignOutIcon aria-hidden="true" />
            Đăng xuất
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <section
          aria-labelledby="profile-stats"
          className="rounded-[28px] bg-white p-5 shadow-sheet-lime sm:p-6"
        >
          <h2 id="profile-stats" className="text-xl font-black text-ink">
            Thành tích
          </h2>
          <p className="text-sm font-extrabold text-sky-ink">Your progress</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col-reverse items-center rounded-2xl bg-sun-wash px-3 py-4 text-center">
              <dt className="text-sm font-bold text-sun-body">Tổng kinh nghiệm</dt>
              <dd className="flex flex-col items-center gap-2">
                <span className="flex size-12 -rotate-6 items-center justify-center rounded-2xl bg-sun text-ink shadow-[0_4px_0_#B78A00]">
                  <TrophyIcon size={28} weight="fill" aria-hidden="true" />
                </span>
                <span className="text-3xl font-black tabular-nums text-ink">
                  {profile.xp.toLocaleString("vi-VN")}
                </span>
              </dd>
            </div>
            <div className="flex flex-col-reverse items-center rounded-2xl bg-cherry-wash/70 px-3 py-4 text-center">
              <dt className="text-sm font-bold text-ink-body">Chuỗi ngày học</dt>
              <dd className="flex flex-col items-center gap-2">
                <span className="flex size-12 rotate-6 items-center justify-center rounded-2xl bg-tangerine text-white shadow-[0_4px_0_#C2410C]">
                  <FireIcon size={28} weight="fill" aria-hidden="true" />
                </span>
                <span className="text-3xl font-black tabular-nums text-ink">
                  {profile.streakDays}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="profile-info"
          className="rounded-[28px] bg-white p-5 shadow-sheet-lime sm:p-6"
        >
          <h2 id="profile-info" className="text-xl font-black text-ink">
            Thông tin hồ sơ
          </h2>
          <p className="text-sm font-extrabold text-sky-ink">About you</p>
          <dl className="mt-3 divide-y-2 divide-wash">
            {details.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-sm font-bold text-ink-body">{item.label}</dt>
                <dd className="text-right text-base font-extrabold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <UpdateProfileDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        profile={profile}
      />

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
    </div>
  );
}
