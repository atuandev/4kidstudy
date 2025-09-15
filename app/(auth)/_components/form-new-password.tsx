'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/form/form-error'
import { FormSuccess } from '@/components/form/form-success'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ResetPasswordSchema, ResetPasswordSchemaType } from '@/schemas/auth'
import { TypographyH3 } from '@/components/typography'
import { Logo } from '@/components/common/logo'
import { resetPassword } from '@/actions/user/user'
import { useOtpStore } from '@/stores/otpStore'

export function FormNewPassword() {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isSpending, startTransition] = useTransition()
  const { email } = useOtpStore()

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: email || '',
      newPassword: '',
    },
  })

  const onSubmit = (values: ResetPasswordSchemaType) => {
    startTransition(async () => {
      try {
        await resetPassword(values)
        setSuccess('Thay đổi mật khẩu thành công.')

        router.push('/login')
      } catch {
        setError('Thay đổi mật khẩu thất bại')
      }
    })
  }

  return (
    <div className='p-6 rounded-lg min-w-[480px] max-w-[600px] bg-background space-y-4 shadow border'>
      <div className='w-fit'>
        <Logo size={20} />
      </div>

      <TypographyH3>Quên mật khẩu</TypographyH3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4 w-full'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder='Nhập email' type='email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isSpending}
                      placeholder='Nhập mật khẩu mới'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button loading={isSpending} disabled={isSpending} type='submit' className='w-full'>
            Xác nhận
          </Button>
        </form>
      </Form>
    </div>
  )
}
