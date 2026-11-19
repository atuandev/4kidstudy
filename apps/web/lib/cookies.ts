'use server'

import { cookies } from 'next/headers'

export const setTokenToCookies = async (accessToken: string, refreshToken: string) => {
  const cookiesStore = await cookies()

  cookiesStore.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })

  cookiesStore.set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })
}
