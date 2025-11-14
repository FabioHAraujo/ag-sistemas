import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  const isProduction = process.env.NODE_ENV === 'production'
  const forceInsecure = process.env.FORCE_INSECURE_COOKIES === 'true'

  // Remove o cookie de autenticação
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: isProduction && !forceInsecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  // Também deleta explicitamente
  response.cookies.delete('auth-token')

  return response
}
