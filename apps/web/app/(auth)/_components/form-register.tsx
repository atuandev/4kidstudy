"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegisterSchema, RegisterSchemaType } from "@/schemas/auth";
import { TypographyH3 } from "@/components/typography";
import Image from "next/image";
import { useOtpStore } from "@/stores/otpStore";
import { sendEmailOTP } from "@/actions/auth/verify-otp";
import { GRADES } from "@/types/grade";

export function FormRegister() {
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
      grade: "GRADE_1",
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
    <div className="p-6 rounded-lg min-w-[480px] max-w-[600px] bg-background space-y-4 shadow border">
      <div className="w-fit">
        <Image src="/mascot.svg" alt="Logo" width={40} height={40} />
        <span className="text-2xl font-bold">4KisStudy</span>
      </div>

      <TypographyH3>Đăng ký</TypographyH3>

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
                  <FormLabel>Khối lớp</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSpending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khối lớp" />
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
            className="w-full"
            variant="secondary"
          >
            Đăng ký
          </Button>
          <Button
            size="sm"
            variant="link"
            asChild
            className="px-0 font-normal w-full text-gray-800"
          >
            <Link href="/login">Đã có tài khoản? Đăng nhập ngay</Link>
          </Button>
        </form>
      </Form>
    </div>
  );
}
