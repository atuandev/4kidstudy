"use client";

import { AuthCard } from "./auth-card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { register } from "@/actions/auth/register";
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
import { RegisterSchema, RegisterSchemaType } from "@/schemas/auth";
import { useOtpStore } from "@/stores/otpStore";
import { sendEmailOTP } from "@/actions/auth/verify-otp";
import { GRADES, type GradeValue } from "@/types/grade";

interface FormRegisterProps {
  /** Grade to pre-select, e.g. from the homepage grade picker. */
  readonly defaultGrade?: GradeValue;
}

export function FormRegister({ defaultGrade }: FormRegisterProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isSpending, startTransition] = useTransition();
  const { setEmail } = useOtpStore();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      grade: defaultGrade ?? "GRADE_1",
    },
  });

  const onSubmit = (values: RegisterSchemaType) => {
    startTransition(async () => {
      setError("");
      setSuccess("");

      const result = await register(values);

      if (!result.success) {
        setError(result.error || "Đăng ký thất bại");
        return;
      }

      if (!result.data?.user) {
        setError("Đăng ký thất bại");
        return;
      }

      await sendEmailOTP(values.email);
      setEmail(values.email);

      setSuccess("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản");
      router.push("/verify-email");
    });
  };

  return (
    <AuthCard
      title="Đăng ký"
      echo="Create your account"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-black text-sky-ink underline-offset-4 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSpending} placeholder="Nhập tên" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <p id="register-grade-label" className="text-base font-extrabold text-ink">
                    Khối lớp
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby="register-grade-label"
                    className="grid grid-cols-5 gap-2"
                  >
                    {GRADES.map((grade) => (
                      <label key={grade.id} className="block">
                        <input
                          type="radio"
                          name={field.name}
                          value={grade.value}
                          checked={field.value === grade.value}
                          onChange={() => field.onChange(grade.value)}
                          onBlur={field.onBlur}
                          disabled={isSpending}
                          className="peer sr-only"
                        />
                        <span className="flex h-12 cursor-pointer items-center justify-center whitespace-nowrap rounded-2xl border-2 border-b-4 border-edge bg-white text-sm font-black text-ink transition-colors hover:border-sky hover:bg-sky-wash peer-checked:border-sky peer-checked:bg-sky-wash peer-checked:text-sky-ink peer-focus-visible:ring-4 peer-focus-visible:ring-sky/50 peer-disabled:opacity-60 sm:text-base">
                          {grade.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} disabled={isSpending} placeholder="Nhập mật khẩu" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhập lại mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isSpending}
                      placeholder="Nhập lại mật khẩu"
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
            Đăng ký
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
