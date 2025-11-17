import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { updateMembershipSchema } from '@/lib/validators/membership'

/**
 * GET /api/memberships/[id]
 * Busca associação por ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: {
          orderBy: {
            dueDate: 'desc',
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Associação não encontrada' }, { status: 404 })
    }

    // Membros só podem ver suas próprias associações
    if (user.role !== 'ADMIN' && membership.memberId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(membership)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/memberships/[id]
 * Atualiza associação (somente admin)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const data = validateRequest(updateMembershipSchema, body)

    const membership = await prisma.membership.findUnique({
      where: { id },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Associação não encontrada' }, { status: 404 })
    }

    const updated = await prisma.membership.update({
      where: { id },
      data: {
        ...data,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
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
 * DELETE /api/memberships/[id]
 * Cancela associação (somente admin)
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

    const membership = await prisma.membership.findUnique({
      where: { id },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Associação não encontrada' }, { status: 404 })
    }

    // Em vez de deletar, cancelar a associação
    await prisma.membership.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
      },
    })

    return NextResponse.json({ message: 'Associação cancelada com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}
