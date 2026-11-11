/** The address the request body names, trimmed, lowercased and in Unicode NFC, or `''`. */
export function accountEmail(req: { body?: { email?: unknown } }): string {
  const email = req.body?.email;
  return typeof email === 'string' ? email.trim().normalize('NFC').toLowerCase().slice(0, 254) : '';
}
