import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { meetingSchema } from '@/lib/validators/meeting'

/**
 * GET /api/meetings
 * Lista reuniões (com filtros opcionais)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (type) where.type = type
    if (upcoming === 'true') {
      where.meetingDate = { gte: new Date() }
    }

    const meetings = await prisma.meeting.findMany({
      where,
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
      orderBy: { meetingDate: 'desc' },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/meetings
 * Cria nova reunião (somente admin)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem criar reuniões.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = validateRequest(meetingSchema, body)

    const meeting = await prisma.meeting.create({
      data: {
        ...data,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
