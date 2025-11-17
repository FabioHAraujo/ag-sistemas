import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { updatePaymentSchema } from '@/lib/validators/payment'

/**
 * GET /api/payments/[id]
 * Busca pagamento por ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
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
            amount: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Membros só podem ver seus próprios pagamentos
    if (user.role !== 'ADMIN' && payment.memberId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/payments/[id]
 * Atualiza pagamento (somente admin)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const data = validateRequest(updatePaymentSchema, body)

    const payment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        ...data,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
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

    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/payments/[id]
 * Cancela pagamento (somente admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Cancelar o pagamento
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json({ message: 'Pagamento cancelado com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}
