import { cookies, headers } from 'next/headers'
import { verifyToken } from './jwt'

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
}

/**
 * Obtém o usuário autenticado a partir do token JWT
 * Para uso em Server Components e API Routes
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Tentar obter do cookie primeiro
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      // Tentar obter do header Authorization
      const headersList = await headers()
      const authHeader = headersList.get('authorization')
      const bearerToken = authHeader?.replace('Bearer ', '')

      if (!bearerToken) {
        return null
      }

      const payload = verifyToken(bearerToken)
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      }
    }

    const payload = verifyToken(token)
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  } catch (_error) {
    return null
  }
}

/**
 * Obtém o payload do JWT a partir dos headers (injetados pelo middleware)
 * Para uso em API Routes após o middleware
 */
export async function getUserFromHeaders(): Promise<AuthUser | null> {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userEmail = headersList.get('x-user-email')
    const userRole = headersList.get('x-user-role')

    if (!userId || !userEmail || !userRole) {
      return null
    }

    return {
      id: userId,
      email: userEmail,
      role: userRole as 'ADMIN' | 'MEMBER',
    }
  } catch (_error) {
    return null
  }
}

/**
 * Verifica se o usuário atual é ADMIN
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Requer que o usuário esteja autenticado
 * Lança erro se não estiver
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Não autenticado')
  }
  return user
}

/**
 * Requer que o usuário seja ADMIN
 * Lança erro se não for
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Acesso negado. Requer permissões de administrador.')
  }
  return user
}
