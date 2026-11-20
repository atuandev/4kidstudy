import type { CloudinaryUploadWidgetResults } from "next-cloudinary";

/** The uploaded file's HTTPS URL from a CldUploadWidget result, if any. */
export function getUploadedUrl(result: CloudinaryUploadWidgetResults): string | undefined {
  const { info } = result;
  return typeof info === "object" ? info?.secure_url : undefined;
}
