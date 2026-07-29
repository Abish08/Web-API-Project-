export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const backendOrigin =
    process.env.NEXT_PUBLIC_API_ORIGIN ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ??
    "http://localhost:8089";

  return `${backendOrigin.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}
