import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validators/payment'

/**
 * GET /api/payments
 * Lista pagamentos (admin vê todos, membro vê apenas os seus)
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

    // Membros veem apenas seus próprios pagamentos
    const where =
      user.role === 'ADMIN'
        ? {
            ...(status && { status: status as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' }),
            ...(memberId && { memberId }),
          }
        : {
            memberId: user.id,
          }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        membership: {
          select: {
            id: true,
            planType: true,
            status: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/payments
 * Cria novo pagamento (somente admin)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem criar pagamentos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = validateRequest(paymentSchema, body)

    // Verificar se a associação existe
    const membership = await prisma.membership.findUnique({
      where: { id: data.membershipId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Associação não encontrada' }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        membership: {
          select: {
            id: true,
            planType: true,
          },
        },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
