"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { UpdateProfileSchema, UpdateProfileSchemaType } from "@/schemas/user";
import { updateProfile } from "@/actions/user/user";
import { GRADES } from "@/types/grade";
import { User, Gender } from "@/types";
import { UploadSimpleIcon } from "@/components/icons";

interface UpdateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: User;
  onSuccess?: () => void;
}

export function UpdateProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: UpdateProfileDialogProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);

  const form = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: profile.name,
      grade: profile.grade,
      dob: profile.dob ? new Date(profile.dob).toISOString().split("T")[0] : "",
      gender: profile.gender,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: UpdateProfileSchemaType) => {
    startTransition(async () => {
      setError("");
      setSuccess("");

      try {
        await updateProfile(values);
        setSuccess("Cập nhật thông tin thành công");

        // Close dialog after 1.5 seconds
        setTimeout(() => {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
          // Reload the page to refresh profile data
          window.location.reload();
        }, 1500);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Cập nhật thông tin thất bại");
        }
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-ink">
            Cập nhật thông tin cá nhân
          </DialogTitle>
          <DialogDescription>
            Thay đổi thông tin cá nhân của bạn. Nhấn lưu để cập nhật.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="size-24 -rotate-3 border-[5px] border-white shadow-sticker">
                <AvatarImage src={avatarPreview} alt="" />
                <AvatarFallback className="bg-leaf-deep text-2xl font-black text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>

              <FormField
                control={form.control}
                name="avatar"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="avatar"
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border-2 border-b-4 border-edge bg-white px-4 text-sm font-bold text-ink transition-colors hover:bg-wash active:translate-y-0.5 active:border-b-2 has-[+*:focus-visible]:ring-4 has-[+*:focus-visible]:ring-sky/50"
                    >
                      <UploadSimpleIcon className="size-4" aria-hidden="true" />
                      Tải ảnh lên
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập họ và tên" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grade */}
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khối học</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khối học" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade.id} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="UNSET">Không xác định</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError message={error} />
            <FormSuccess message={success} />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" variant="secondary" className="flex-1" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
