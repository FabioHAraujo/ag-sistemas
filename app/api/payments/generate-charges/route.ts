import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/payments/generate-charges
 * Gera cobranças mensais para todas as associações ativas (somente admin)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { month, year } = body

    if (!month || !year) {
      return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 })
    }

    // Buscar todas as associações ativas
    const activeMemberships = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
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

    if (activeMemberships.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma associação ativa encontrada', paymentsCreated: 0 },
        { status: 200 }
      )
    }

    // Calcular data de vencimento (dia 10 do mês especificado)
    const dueDate = new Date(year, month - 1, 10)

    // Verificar se já existem cobranças para este mês
    const existingPayments = await prisma.payment.findMany({
      where: {
        dueDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    })

    const existingMembershipIds = existingPayments.map((p) => p.membershipId)

    // Criar cobranças apenas para associações que não têm cobrança neste mês
    const paymentsToCreate = activeMemberships
      .filter((m) => !existingMembershipIds.includes(m.id))
      .map((membership) => ({
        membershipId: membership.id,
        memberId: membership.memberId,
        amount: membership.amount,
        dueDate,
        status: 'PENDING' as const,
      }))

    if (paymentsToCreate.length === 0) {
      return NextResponse.json(
        {
          message: 'Todas as associações ativas já possuem cobrança para este mês',
          paymentsCreated: 0,
        },
        { status: 200 }
      )
    }

    // Criar cobranças em batch
    const result = await prisma.payment.createMany({
      data: paymentsToCreate,
    })

    return NextResponse.json({
      message: `${result.count} cobrança(s) gerada(s) com sucesso`,
      paymentsCreated: result.count,
      month,
      year,
      dueDate,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
