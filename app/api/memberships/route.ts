import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { membershipSchema } from '@/lib/validators/membership'

/**
 * GET /api/memberships
 * Lista associações (admin vê todas, membro vê apenas a sua)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')

    // Membros veem apenas suas próprias associações
    const where =
      user.role === 'ADMIN'
        ? {
            ...(status && { status: status as 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' }),
            ...(memberId && { memberId }),
          }
        : {
            memberId: user.id,
          }

    const memberships = await prisma.membership.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            dueDate: true,
            paidAt: true,
            status: true,
          },
          orderBy: {
            dueDate: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(memberships)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/memberships
 * Cria nova associação (somente admin)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem criar associações.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = validateRequest(membershipSchema, body)

    // Verificar se o membro existe
    const member = await prisma.user.findUnique({
      where: { id: data.memberId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
    }

    // Verificar se já existe associação ativa
    const existingMembership = await prisma.membership.findFirst({
      where: {
        memberId: data.memberId,
        status: 'ACTIVE',
      },
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Membro já possui associação ativa' }, { status: 400 })
    }

    const membership = await prisma.membership.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
