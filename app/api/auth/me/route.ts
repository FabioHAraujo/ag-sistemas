import { type NextRequest, NextResponse } from 'next/server'
import { type JWTPayload, verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Buscar token do cookie ou header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar token
    let payload: JWTPayload
    try {
      payload = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Token inválido' },
        { status: 401 }
      )
    }

    // Buscar usuário atualizado
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
