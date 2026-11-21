import type { CloudinaryUploadWidgetResults } from "next-cloudinary";

export function getUploadedUrl(result: CloudinaryUploadWidgetResults): string | undefined {
  const { info } = result;
  return typeof info === "object" ? info?.secure_url : undefined;
}
