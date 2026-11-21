import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { refreshAccessToken } from "./actions/auth/refresh";

const ROUTES = {
  protected: ["/learn", "/practice", "/grade", "/leaderboard", "/profile"],
  admin: ["/admin"],
  auth: ["/login", "/register"],
};

interface AuthToken extends JwtPayload {
  role: string;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const headers = new Headers(request.headers);
  headers.set("x-current-path", pathname);
  const response = NextResponse.next({ request: { headers } });

  checkExpiredToken(accessToken, request, response);

  if (accessToken && refreshToken) {
    await handleTokenRefresh(accessToken, refreshToken, response);
  }

  if (accessToken) {
    const decoded = decodeToken(accessToken);
    const isAdmin = decoded?.role.includes("ADMIN");

    if (isMatchingRoute(pathname, ROUTES.auth)) {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      if (redirectParam) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }
      return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/learn", request.url));
    }

    if (isMatchingRoute(pathname, ROUTES.admin)) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/learn", request.url));
      }
    }

    if (isMatchingRoute(pathname, ROUTES.protected)) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  } else {
    if (isMatchingRoute(pathname, [...ROUTES.protected, ...ROUTES.admin])) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

async function handleTokenRefresh(
  accessToken: string,
  refreshToken: string,
  response: NextResponse,
) {
  try {
    const decoded = decodeToken(accessToken);

    if (decoded?.exp && decoded.exp < Date.now() / 1000) {
      const payload = await refreshAccessToken(refreshToken);

      if (payload?.accessToken && payload?.refreshToken) {
        response.cookies.set("accessToken", payload.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
        });
        response.cookies.set("refreshToken", payload.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
        });
      }
    }
  } catch (error) {
    console.error("Token decode error:", error);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }
}

const checkExpiredToken = (
  token: string | undefined,
  request: NextRequest,
  response: NextResponse,
) => {
  if (!token) {
    return;
  }

  const decoded = decodeToken(token);
  if (decoded?.exp && decoded.exp < Date.now() / 1000) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return NextResponse.redirect(new URL("/login", request.url));
  }
};

function decodeToken(token: string): AuthToken | null {
  try {
    return jwtDecode<AuthToken>(token);
  } catch {
    return null;
  }
}

function isMatchingRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
