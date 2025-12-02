'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
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
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { email, clearEmail } = useOtpStore()

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: email || '',
      newPassword: '',
    },
  })

  useEffect(() => {
    // Don't redirect if we're in the middle of a successful password reset
    if (!email && !isRedirecting) {
      router.push('/forget-password')
      return
    }
  }, [email, router, isRedirecting])

  const onSubmit = (values: ResetPasswordSchemaType) => {
    startTransition(async () => {
      setError('')
      setSuccess('')
      
      try {
        await resetPassword(values)
        setSuccess('Thay đổi mật khẩu thành công.')
        
        // Set redirecting flag before clearing email
        setIsRedirecting(true)
        
        // Clear password reset flow flag
        sessionStorage.removeItem('flowType')
        
        // Clear email and redirect after a short delay
        setTimeout(() => {
          clearEmail()
          router.push('/login')
        }, 1500)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Thay đổi mật khẩu thất bại. Vui lòng thử lại.')
        }
      }
    })
  }

  return (
    <div className='p-6 rounded-lg min-w-[480px] max-w-[600px] bg-background space-y-4 shadow border'>
      <div className='w-fit'>
        <Logo />
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
