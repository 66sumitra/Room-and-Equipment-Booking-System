import { NextRequest } from 'next/server';
import { verifySessionJwt, SessionPayload } from './jwt';

export type SessionUser = SessionPayload;

export async function getSessionUser(
  request: NextRequest
): Promise<SessionUser | null> {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  return await verifySessionJwt(token);
}

export async function requireAdmin(
  request: NextRequest
): Promise<SessionUser | null> {
  const user = await getSessionUser(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

