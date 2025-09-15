'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/form/form-error'
import { FormSuccess } from '@/components/form/form-success'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ForgetPasswordSchema, ForgetPasswordSchemaType } from '@/schemas/auth'
import { TypographyH3 } from '@/components/typography'
import { Logo } from '@/components/common/logo'
import { useOtpStore } from '@/stores/otpStore'
import { sendEmailOTP } from '@/actions/auth/verify-otp'

export function FormForgetPassword() {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isSpending, startTransition] = useTransition()
  const { setEmail } = useOtpStore()

  const form = useForm<ForgetPasswordSchemaType>({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (values: ForgetPasswordSchemaType) => {
    startTransition(async () => {
      try {
        await sendEmailOTP(values.email)
        setEmail(values.email)

        // Set a session flag to indicate we're in the password reset flow
        sessionStorage.setItem('flowType', 'password-reset')

        setSuccess('Gửi mã xác thực thành công. Vui lòng kiểm tra email của bạn.')
        router.push('/verify-email')
      } catch {
        setError('Đăng ký thất bại')
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
                    <Input {...field} disabled={isSpending} placeholder='Nhập email' type='email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button loading={isSpending} disabled={isSpending} type='submit' className='w-full'>
            Gửi mã xác thực
          </Button>
        </form>
      </Form>
    </div>
  )
}
