import { TargetAudience } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { announcementSchema } from '@/lib/validators/announcement'

/**
 * GET /api/announcements
 * Lista avisos publicados (membros veem apenas publicados, admin vê todos)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const targetAudienceParam = searchParams.get('targetAudience')

    // Valida o enum se fornecido
    const targetAudience =
      targetAudienceParam && ['ALL', 'MEMBERS', 'ADMINS'].includes(targetAudienceParam)
        ? (targetAudienceParam as TargetAudience)
        : undefined

    // Membros veem apenas avisos publicados e direcionados a eles
    const where =
      user.role === 'ADMIN'
        ? {
            ...(published !== null && { published: published === 'true' }),
            ...(targetAudience && { targetAudience }),
          }
        : {
            published: true,
            OR: [
              { targetAudience: TargetAudience.ALL },
              { targetAudience: TargetAudience.MEMBERS },
            ],
          }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    })

    return NextResponse.json(announcements)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/announcements
 * Cria novo aviso (somente admin)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem criar avisos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = validateRequest(announcementSchema, body)

    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        authorId: user.id,
        publishedAt: data.published ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
