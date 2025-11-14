import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { meetingSchema } from '@/lib/validators/meeting'

/**
 * GET /api/meetings/:id
 * Retorna detalhes de uma reunião específica
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/meetings/:id
 * Atualiza uma reunião (somente admin)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem editar reuniões.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = validateRequest(meetingSchema.partial(), body)

    const { id } = await params
    const meeting = await prisma.meeting.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/meetings/:id
 * Remove uma reunião (apenas admin)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem excluir reuniões.' },
        { status: 403 }
      )
    }

    const { id } = await params
    await prisma.meeting.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Reunião excluída com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}
