import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

export interface JWTPayload {
  sub: string // user ID
  email: string
  role: Role
  iat?: number
  exp?: number
}

/**
 * Gera um token JWT para um usuário
 */
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  })
}

/**
 * Verifica e decodifica um token JWT
 * @throws Error se o token for inválido ou expirado
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido')
    }
    throw error
  }
}

/**
 * Decodifica um token sem verificar a assinatura (útil para debug)
 */
export function decodeToken(token: string): JWTPayload | null {
  return jwt.decode(token) as JWTPayload | null
}
