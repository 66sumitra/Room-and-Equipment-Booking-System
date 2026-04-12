import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

const JWT_SECRET = process.env.AUTH_JWT_SECRET;

function getSecretKey() {
  if (!JWT_SECRET) {
    throw new Error('AUTH_JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(JWT_SECRET);
}
const ALG = 'HS256';

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signSessionJwt(
  payload: SessionPayload,
  expiresIn: string = '7d'
): Promise<string> {
  const jwtPayload: JWTPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  return await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifySessionJwt(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [ALG],
    });

    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

