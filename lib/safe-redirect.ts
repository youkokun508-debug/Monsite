// Empêche les redirections vers un autre site (« open redirect »).
// N'accepte qu'un chemin interne du type « /mon-compte ».
export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  return value;
}
