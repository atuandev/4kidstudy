"use client";

import { AuthCard } from "./auth-card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/actions/auth/login";
import { LoginSchema, LoginSchemaType } from "@/schemas/auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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

interface FormLoginProps {
  redirect: string;
}

export function FormLogin({ redirect }: FormLoginProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginSchemaType) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await login(values);

      if (!result.success) {
        setError(result.error || "Đăng nhập thất bại");
        return;
      }

      if (!result.data?.user) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác");
        return;
      }

      setSuccess("Đăng nhập thành công");
      router.push(redirect);
    });
  };

  return (
    <AuthCard
      title="Đăng nhập"
      echo="Welcome back!"
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-black text-sky-ink underline-offset-4 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </>
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
                    <Input {...field} disabled={isPending} placeholder="Nhập email" type="email" />
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
                    <PasswordInput {...field} disabled={isPending} placeholder="Nhập mật khẩu" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Link
                href="/forget-password"
                className="rounded-lg px-1 text-sm font-extrabold text-sky-ink underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-sky/50"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            loading={isPending}
            type="submit"
            size="lg"
            className="h-12 w-full uppercase"
            variant="secondary"
          >
            Đăng nhập
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
