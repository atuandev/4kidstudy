"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Signs the user out: the API keeps no session (tokens are stateless JWTs), so this
 * only drops the auth cookies. Redirecting here, inside the action, makes Next render
 * /login instead of re-rendering the current page, whose layout would otherwise refetch
 * the profile without a token and fail with 401.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  redirect("/login");
}
