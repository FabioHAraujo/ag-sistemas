import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/applications', // POST público para criar application
]

// Rotas que requerem autenticação
const protectedRoutes = [
  '/api/auth/me',
  '/api/admin',
  '/api/members',
  '/api/referrals',
  '/api/meetings',
  '/api/announcements',
  '/api/dashboard',
  '/api/payments',
]

// Rotas que requerem role ADMIN
const adminRoutes = [
  '/api/admin',
  '/api/applications', // GET, PATCH para admin
  '/api/meetings', // POST para admin
  '/api/announcements', // POST, PATCH, DELETE para admin
  '/api/payments', // GET, PATCH para admin
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota de API
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if (isPublicRoute && request.method === 'POST') {
    return NextResponse.next()
  }

  // Verificar se é rota protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Buscar token do cookie ou header
  const token =
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar token
  try {
    const payload = verifyToken(token)

    // Verificar se usuário está ativo
    // Nota: Isso poderia fazer uma query ao DB, mas por performance
    // vamos confiar no token. O status é verificado no login.

    // Verificar se rota requer ADMIN
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
    if (isAdminRoute && request.method !== 'GET' && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Requer permissões de administrador.' },
        { status: 403 }
      )
    }

    // Adicionar user info aos headers para uso nas API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Token inválido' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: '/api/:path*',
}
