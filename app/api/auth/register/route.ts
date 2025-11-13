import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyDescription: z.string().optional(),
  expertiseArea: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { token, password, ...profileData } = validation.data

    // Buscar application pelo token
    const application = await prisma.application.findUnique({
      where: { token },
      include: { profile: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    // Verificar se já foi usado
    if (application.profile) {
      return NextResponse.json({ error: 'Token já foi utilizado' }, { status: 400 })
    }

    // Verificar se está aprovado
    if (application.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Inscrição ainda não foi aprovada' }, { status: 400 })
    }

    // Verificar expiração
    if (application.tokenExpiresAt && application.tokenExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Criar usuário e perfil em transação
    const passwordHash = await hashPassword(password)

    const user = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const newUser = await tx.user.create({
        data: {
          email: application.email,
          name: application.name,
          passwordHash,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      })

      // Criar perfil
      await tx.memberProfile.create({
        data: {
          userId: newUser.id,
          applicationId: application.id,
          phone: profileData.phone,
          company: application.company,
          position: profileData.position,
          companyDescription: profileData.companyDescription,
          expertiseArea: profileData.expertiseArea,
          linkedinUrl: profileData.linkedinUrl,
          websiteUrl: profileData.websiteUrl,
          bio: profileData.bio,
        },
      })

      return newUser
    })

    // Gerar token JWT para login automático
    const authToken = signToken({
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
      token: authToken,
    })

    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
