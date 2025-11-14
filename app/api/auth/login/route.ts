import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken } from '@/lib/auth/jwt'
import { verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Verificar senha
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Verificar status do usuário
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Usuário inativo ou suspenso' }, { status: 403 })
    }

    // Gerar token JWT
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    // Criar resposta com cookie httpOnly
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })

    // Cookie config - secure apenas em produção com HTTPS
    const isProduction = process.env.NODE_ENV === 'production'
    const forceInsecure = process.env.FORCE_INSECURE_COOKIES === 'true'

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction && !forceInsecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    console.log(
      'Cookie set with secure:',
      isProduction && !forceInsecure,
      'NODE_ENV:',
      process.env.NODE_ENV
    )

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
