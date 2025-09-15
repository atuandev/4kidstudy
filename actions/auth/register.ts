'use server'

import { setTokenToCookies } from '@/lib/cookies';
import http from '@/lib/http'
import { RegisterSchemaType } from '@/schemas/auth'

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    dob: string;
    gender: string;
    avatarUrl: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const register = async (data: RegisterSchemaType) => {
  const { payload } = await http.post<RegisterResponse>(`/auth/register`, JSON.stringify({
    email: data.email,
    name: data.name,
    password: data.password,
  }), {
    noAuth: true,
  })

  console.log(payload);

  if (payload.user) {
    await setTokenToCookies(
      payload.tokens.accessToken,
      payload.tokens.refreshToken
    );
  }

  return payload
}
