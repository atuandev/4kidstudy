"use client";

import Link from "next/link";
import { AuthCard } from "./auth-card";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ResetPasswordSchema, ResetPasswordSchemaType } from "@/schemas/auth";
import { resetPassword } from "@/actions/user/user";
import { useOtpStore } from "@/stores/otpStore";

export function FormNewPassword() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isSpending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { email, clearEmail } = useOtpStore();

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: email || "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (!email && !isRedirecting) {
      router.push("/forget-password");
      return;
    }
  }, [email, router, isRedirecting]);

  const onSubmit = (values: ResetPasswordSchemaType) => {
    startTransition(async () => {
      setError("");
      setSuccess("");

      try {
        await resetPassword(values);
        setSuccess("Thay đổi mật khẩu thành công.");

        setIsRedirecting(true);

        sessionStorage.removeItem("flowType");

        setTimeout(() => {
          clearEmail();
          router.push("/login");
        }, 1500);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Thay đổi mật khẩu thất bại. Vui lòng thử lại.");
        }
      }
    });
  };

  return (
    <AuthCard
      title="Đặt mật khẩu mới"
      echo="Set a new password"
      footer={
        <Link href="/login" className="font-black text-sky-ink underline-offset-4 hover:underline">
          Quay lại đăng nhập
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder="Nhập email" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isSpending}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            loading={isSpending}
            disabled={isSpending}
            type="submit"
            size="lg"
            className="h-12 w-full uppercase"
            variant="secondary"
          >
            Xác nhận
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
