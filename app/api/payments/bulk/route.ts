import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/payments/bulk
 * Cria cobranças em lote para múltiplos membros (somente admin)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem criar cobranças.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { memberIds, planType, amount, dueDate, description } = body

    // Validações
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'Lista de membros é obrigatória' }, { status: 400 })
    }

    if (!planType || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Tipo de plano, valor e data de vencimento são obrigatórios' },
        { status: 400 }
      )
    }

    const parsedAmount = Number.parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const parsedDueDate = new Date(dueDate)
    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: 'Data de vencimento inválida' }, { status: 400 })
    }

    // Verificar ou criar memberships para cada membro
    const payments = []

    for (const memberId of memberIds) {
      // Verificar se o membro existe
      const member = await prisma.user.findUnique({
        where: { id: memberId },
      })

      if (!member) {
        console.warn(`Membro ${memberId} não encontrado, pulando...`)
        continue
      }

      // Buscar ou criar membership ativa para o membro com o planType especificado
      let membership = await prisma.membership.findFirst({
        where: {
          memberId,
          status: 'ACTIVE',
          planType,
        },
      })

      // Se não existir membership ativa com esse planType, criar uma
      if (!membership) {
        membership = await prisma.membership.create({
          data: {
            memberId,
            planType,
            amount: parsedAmount,
            startDate: new Date(),
            status: 'ACTIVE',
          },
        })
      }

      // Criar o pagamento
      const payment = await prisma.payment.create({
        data: {
          membershipId: membership.id,
          memberId,
          amount: parsedAmount,
          dueDate: parsedDueDate,
          status: 'PENDING',
          notes: description || null,
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

      payments.push(payment)
    }

    return NextResponse.json(
      {
        success: true,
        count: payments.length,
        payments,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
