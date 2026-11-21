"use client";

import { AuthCard } from "./auth-card";
import { useForm } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { VerifyEmailSchema, VerifyEmailSchemaType } from "@/schemas/auth";
import { verifyOTP } from "@/actions/auth/verify-otp";
import { useRouter } from "next/navigation";
import { useOtpStore } from "@/stores/otpStore";

export function FormVerifyEmail() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isSpending, startTransition] = useTransition();
  const { email, clearEmail } = useOtpStore();

  const form = useForm<VerifyEmailSchemaType>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      email: email || "",
      otp: "",
    },
  });

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }

    const referrer = document.referrer;
    const isFromForgetPassword =
      referrer.includes("/forget-password") ||
      sessionStorage.getItem("flowType") === "password-reset";

    if (!isFromForgetPassword) {
      return;
    }

    sessionStorage.setItem("flowType", "password-reset");
  }, [email, router]);

  const onSubmit = (data: VerifyEmailSchemaType) => {
    startTransition(async () => {
      try {
        const { success, message } = await verifyOTP(data);

        if (!success) {
          setError(message);
          return;
        }

        setSuccess("Xác thực thành công.");

        const isPasswordReset = sessionStorage.getItem("flowType") === "password-reset";
        if (isPasswordReset) {
          router.push("/new-password");
        } else {
          clearEmail();
          router.push("/login");
        }
      } catch {
        setError("OTP không chính xác hoặc đã hết hạn.");
      }
    });
  };

  return (
    <AuthCard
      title="Xác thực email"
      echo="Check your email"
      description="Nhập mã OTP vừa được gửi tới email của bạn."
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
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSpending} placeholder="Nhập OTP" />
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
            Xác thực
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
