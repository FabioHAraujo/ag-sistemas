import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { announcementSchema } from '@/lib/validators/announcement'

/**
 * GET /api/announcements/:id
 * Retorna detalhes de um aviso específico
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const announcement = await prisma.announcement.findUnique({
      where: { id },
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

    if (!announcement) {
      return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
    }

    // Membros só podem ver avisos publicados
    if (user.role !== 'ADMIN' && !announcement.published) {
      return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/announcements/:id
 * Atualiza um aviso (somente admin)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem editar avisos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = validateRequest(announcementSchema.partial(), body)

    const { id } = await params
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        ...(data.published && !body.publishedAt && { publishedAt: new Date() }),
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

    return NextResponse.json(announcement)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/announcements/:id
 * Remove um aviso (apenas admin)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Somente administradores podem excluir avisos.' },
        { status: 403 }
      )
    }

    const { id } = await params
    await prisma.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Aviso excluído com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}
