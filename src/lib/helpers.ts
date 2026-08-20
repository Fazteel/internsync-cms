export const getStorageUrl = (path?: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const baseUrl = (import.meta.env.VITE_API_URL as string) || "https://api-internsync.smkpgritelagasari.sch.id";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Ensure path doesn't start with a slash if we add it
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBase}/storage/${cleanPath}`;
};
