import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { oneOnOneMeetingSchema } from '@/lib/validators/meeting'

/**
 * GET /api/one-on-ones
 * Lista reuniões 1-a-1 do membro (agendadas ou completadas)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Buscar reuniões onde o usuário é participante
    const where: Record<string, unknown> = {
      OR: [{ memberOneId: user.id }, { memberTwoId: user.id }],
    }

    if (status && ['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    const meetings = await prisma.oneOnOneMeeting.findMany({
      where,
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
                profileImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { meetingDate: 'desc' },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/one-on-ones
 * Cria uma nova reunião 1-a-1
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = validateRequest(oneOnOneMeetingSchema, body)

    // Verificar se o membro indicado existe
    const memberTwo = await prisma.user.findUnique({
      where: { id: data.memberTwoId },
    })

    if (!memberTwo) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
    }

    // Não permitir agendar consigo mesmo
    if (user.id === data.memberTwoId) {
      return NextResponse.json(
        { error: 'Não é possível agendar reunião consigo mesmo' },
        { status: 400 }
      )
    }

    // Criar reunião 1-a-1
    const meeting = await prisma.oneOnOneMeeting.create({
      data: {
        memberOneId: user.id,
        memberTwoId: data.memberTwoId,
        meetingDate: new Date(data.meetingDate),
        location: data.location,
        notes: data.notes,
        status: 'SCHEDULED',
      },
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

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
