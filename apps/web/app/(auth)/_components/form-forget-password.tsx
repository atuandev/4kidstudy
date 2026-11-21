"use client";

import Link from "next/link";
import { AuthCard } from "./auth-card";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { ForgetPasswordSchema, ForgetPasswordSchemaType } from "@/schemas/auth";
import { useOtpStore } from "@/stores/otpStore";
import { sendEmailOTP } from "@/actions/auth/verify-otp";

export function FormForgetPassword() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isSpending, startTransition] = useTransition();
  const { setEmail } = useOtpStore();

  const form = useForm<ForgetPasswordSchemaType>({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgetPasswordSchemaType) => {
    startTransition(async () => {
      setError("");
      setSuccess("");

      try {
        await sendEmailOTP(values.email);
        setEmail(values.email);

        sessionStorage.setItem("flowType", "password-reset");

        setSuccess("Gửi mã xác thực thành công. Vui lòng kiểm tra email của bạn.");
        router.push("/verify-email");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Không thể gửi mã xác thực. Vui lòng thử lại.");
        }
      }
    });
  };

  return (
    <AuthCard
      title="Quên mật khẩu"
      echo="Forgot your password?"
      description="Nhập email của bạn, chúng tôi sẽ gửi mã xác thực."
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
                    <Input {...field} disabled={isSpending} placeholder="Nhập email" type="email" />
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
            Gửi mã xác thực
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
