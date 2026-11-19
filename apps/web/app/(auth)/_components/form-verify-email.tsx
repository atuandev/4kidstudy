'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useState, useTransition } from 'react'
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
import { VerifyEmailSchema, VerifyEmailSchemaType } from '@/schemas/auth'
import { TypographyH3 } from '@/components/typography'
import { Logo } from '@/components/common/logo'
import { verifyOTP } from '@/actions/auth/verify-otp'
import { useRouter } from 'next/navigation'
import { useOtpStore } from '@/stores/otpStore'

export function FormVerifyEmail() {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isSpending, startTransition] = useTransition()
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const { email, clearEmail } = useOtpStore()

  const form = useForm<VerifyEmailSchemaType>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      email: email || '',
      otp: '',
    },
  })

  useEffect(() => {
    if (!email) {
      router.push('/register')
      return
    }

    // Check if we came from the forget-password flow
    const referrer = document.referrer
    const isFromForgetPassword =
      referrer.includes('/forget-password') ||
      sessionStorage.getItem('flowType') === 'password-reset'

    if (!isFromForgetPassword) {
      return
    }

    setIsPasswordReset(true)
    // Store the flow type in case page refreshes
    sessionStorage.setItem('flowType', 'password-reset')
  }, [email, router])

  const onSubmit = (data: VerifyEmailSchemaType) => {
    startTransition(async () => {
      try {
        const { success, message } = await verifyOTP(data)

        if (!success) {
          setError(message)
          return
        }

        setSuccess('Xác thực thành công.')

        // Redirect based on the flow type
        if (isPasswordReset) {
          // DON'T clear email yet - needed for new-password form
          // DON'T clear flowType yet - needed for new-password form
          router.push('/new-password')
        } else {
          // For registration flow, clear email and redirect to login
          clearEmail()
          router.push('/login')
        }
      } catch {
        setError('OTP không chính xác hoặc đã hết hạn.')
      }
    })
  }

  return (
    <div className='p-6 rounded-lg min-w-[480px] max-w-[600px] bg-background space-y-4 shadow border'>
      <div className='w-fit'>
        <Logo />
      </div>

      <TypographyH3>Xác thực OTP</TypographyH3>

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
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSpending} placeholder='Nhập OTP' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button loading={isSpending} disabled={isSpending} type='submit' className='w-full'>
            Xác thực
          </Button>
        </form>
      </Form>
    </div>
  )
}
