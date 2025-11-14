import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { attendanceSchema } from '@/lib/validators/meeting'

/**
 * POST /api/meetings/:id/attendance
 * Registra presença (check-in) em uma reunião
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = validateRequest(attendanceSchema, body)

    const { id } = await params

    // Verifica se a reunião existe
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    // Admin pode registrar presença de qualquer membro
    // Membro comum só pode registrar a própria presença
    const memberId = user.role === 'ADMIN' && data.memberId ? data.memberId : user.id

    // Verifica se já existe registro de presença
    const existingAttendance = await prisma.meetingAttendance.findUnique({
      where: {
        meetingId_memberId: {
          meetingId: id,
          memberId,
        },
      },
    })

    let attendance: Awaited<
      ReturnType<typeof prisma.meetingAttendance.create | typeof prisma.meetingAttendance.update>
    >

    if (existingAttendance) {
      // Atualiza presença existente
      attendance = await prisma.meetingAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: data.status,
          checkedInAt: data.status === 'PRESENT' ? new Date() : null,
          notes: data.notes,
        },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          meeting: {
            select: {
              id: true,
              title: true,
              meetingDate: true,
            },
          },
        },
      })
    } else {
      // Cria nova presença
      attendance = await prisma.meetingAttendance.create({
        data: {
          meetingId: id,
          memberId,
          status: data.status,
          checkedInAt: data.status === 'PRESENT' ? new Date() : null,
          notes: data.notes,
        },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          meeting: {
            select: {
              id: true,
              title: true,
              meetingDate: true,
            },
          },
        },
      })
    }

    return NextResponse.json(attendance, { status: existingAttendance ? 200 : 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/meetings/:id/attendance
 * Lista presenças de uma reunião específica
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const attendances = await prisma.meetingAttendance.findMany({
      where: { meetingId: id },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    })

    return NextResponse.json(attendances)
  } catch (error) {
    return handleApiError(error)
  }
}
