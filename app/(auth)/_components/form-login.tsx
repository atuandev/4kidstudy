"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { TypographyH3 } from "@/components/typography";
import Image from "next/image";

export function FormLogin() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO: change to /learn
  const redirect = searchParams.get("redirect") || "/learn/units";

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
      try {
        const { user, tokens } = await login(values);

        if (!user) {
          setError("Tên đăng nhập hoặc mật khẩu không chính xác");
          return;
        }

        setSuccess("Đăng nhập thành công");
        router.push(redirect);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Tên đăng nhập hoặc mật khẩu không chính xác");
        }
      }
    });
  };

  return (
    <div className="p-6 rounded-lg min-w-[480px] max-w-[600px] bg-background space-y-4 shadow border">
      <div className="w-fit flex items-center gap-2">
        <Image src="/mascot.svg" alt="Logo" width={40} height={40} />
        <span className="text-2xl font-bold">4KisStudy</span>
      </div>

      <TypographyH3>Đăng nhập</TypographyH3>

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
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Nhập email"
                      type="email"
                    />
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
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="Nhập mật khẩu"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              size="sm"
              variant="link"
              asChild
              className="px-0 font-normal justify-end w-full text-gray-700"
            >
              <Link href="/forget-password">Quên mật khẩu?</Link>
            </Button>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            loading={isPending}
            type="submit"
            className="w-full"
            variant="secondary"
          >
            Đăng nhập
          </Button>
          <Button
            asChild
            size="sm"
            variant="link"
            className="font-normal w-full text-gray-700"
          >
            <Link href="/register">Chưa có tài khoản? Đăng ký ngay</Link>
          </Button>
        </form>
      </Form>
    </div>
  );
}
