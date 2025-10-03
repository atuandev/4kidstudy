'use server';

import http from '@/lib/http';
import { User } from '@/types';

export const getUsers = async () => {
  const { payload } = await http.get<User[]>('/users');
  return payload;
};