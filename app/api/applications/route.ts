import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { applicationSchema } from '@/lib/validators/application'

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Buscar applications com filtros opcionais
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const applications = await prisma.application.findMany({
      where: status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Erro ao buscar intenções' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar dados com Zod
    const validatedData = applicationSchema.parse(body)

    // Verificar se já existe application com mesmo email
    const existingApplication = await prisma.application.findFirst({
      where: {
        email: validatedData.email,
        status: 'PENDING',
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Já existe uma intenção pendente com este email' },
        { status: 400 }
      )
    }

    // Criar application
    const application = await prisma.application.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        message: 'Intenção de participação enviada com sucesso!',
        application: {
          id: application.id,
          name: application.name,
          email: application.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos', details: error }, { status: 400 })
    }

    console.error('Application creation error:', error)
    return NextResponse.json({ error: 'Erro ao processar intenção' }, { status: 500 })
  }
}
