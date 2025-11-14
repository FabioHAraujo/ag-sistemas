import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().max(500).optional(),
  meetingDate: z.string().datetime().optional(),
  location: z.string().optional(),
})

/**
 * GET /api/one-on-ones/:id
 * Retorna detalhes de uma reunião 1-a-1
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const meeting = await prisma.oneOnOneMeeting.findUnique({
      where: { id },
      include: {
        memberOne: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                company: true,
                position: true,
                phone: true,
                linkedinUrl: true,
                profileImageUrl: true,
              },
            },
          },
        },
        memberTwo: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                company: true,
                position: true,
                phone: true,
                linkedinUrl: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário é participante
    if (meeting.memberOneId !== user.id && meeting.memberTwoId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/one-on-ones/:id
 * Atualiza status, notas ou data de uma reunião 1-a-1
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = validateRequest(updateSchema, body)

    // Verificar se a reunião existe e o usuário é participante
    const existing = await prisma.oneOnOneMeeting.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    if (existing.memberOneId !== user.id && existing.memberTwoId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Atualizar reunião
    const updateData: Record<string, unknown> = {}
    if (data.status) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.location !== undefined) updateData.location = data.location
    if (data.meetingDate) updateData.meetingDate = new Date(data.meetingDate)

    const meeting = await prisma.oneOnOneMeeting.update({
      where: { id },
      data: updateData,
      include: {
        memberOne: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                company: true,
                position: true,
              },
            },
          },
        },
        memberTwo: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                company: true,
                position: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/one-on-ones/:id
 * Remove uma reunião 1-a-1 (apenas quem criou)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.oneOnOneMeeting.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    // Apenas quem criou (memberOne) pode deletar
    if (existing.memberOneId !== user.id) {
      return NextResponse.json(
        { error: 'Apenas quem criou a reunião pode removê-la' },
        { status: 403 }
      )
    }

    await prisma.oneOnOneMeeting.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Reunião removida com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}
