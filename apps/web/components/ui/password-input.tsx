'use client'

import * as React from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'

function PasswordInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [showPassword, setShowPassword] = useState(false)
  const togglePasswordVisibility = () => setShowPassword(prev => !prev)

  return (
    <div className='relative'>
      <input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'flex h-11 w-full min-w-0 rounded-xl border-2 border-edge bg-white px-3.5 py-1 text-base font-bold text-ink transition-[color,border-color,box-shadow] outline-none placeholder:font-normal placeholder:text-ink-meta file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-wash disabled:opacity-60',
          'hover:border-[#CBD5E1] focus-visible:border-sky focus-visible:ring-4 focus-visible:ring-sky/25',
          'aria-invalid:border-cherry-deep aria-invalid:ring-4 aria-invalid:ring-cherry/15',
          'pr-11',
          className
        )}
        {...props}
      />
      <button
        type='button'
        className='absolute inset-y-1 right-1 flex w-9 cursor-pointer items-center justify-center rounded-lg text-ink-meta outline-none hover:bg-wash hover:text-ink focus-visible:ring-4 focus-visible:ring-sky/40'
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={showPassword}
      >
        {showPassword ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
      </button>
    </div>
  )
}

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
