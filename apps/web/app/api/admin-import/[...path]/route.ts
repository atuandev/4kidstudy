import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { TOPICS_CACHE_TAG } from "@/lib/data/topic-cache";

/**
 * Forwards admin Excel/asset imports to the API with the admin's access token.
 * The token is an httpOnly cookie, so the browser can't attach it itself.
 * Only the import endpoints below are reachable through this route.
 */
const ALLOWED_PATHS = [
  /^flashcards\/import\/\d+$/,
  /^sentences\/import-excel\/\d+$/,
  /^exercises\/import-excel\/\d+$/,
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join("/");
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3001/api";
  const upstream = await fetch(`${apiUrl}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Keep the multipart boundary.
      "Content-Type": request.headers.get("content-type") ?? "application/octet-stream",
    },
    body: request.body,
    // Stream the upload instead of buffering it.
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  // Imports add flashcards, sentences or exercises, which the cached topic
  // list counts. Expire it now (route handlers can't use updateTag).
  if (upstream.ok) {
    revalidateTag(TOPICS_CACHE_TAG, { expire: 0 });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
