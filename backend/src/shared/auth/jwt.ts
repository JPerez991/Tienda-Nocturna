import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "../../config/env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ALGORITHM = "HS256";
const EXPIRATION = "7d";

export interface JwtPayload {
  sub: string; // id del usuario
  role: "CUSTOMER" | "ADMIN";
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });
  return payload as unknown as JwtPayload;
}
