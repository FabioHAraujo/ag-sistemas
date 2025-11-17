import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { updateMemberSchema } from '@/lib/validators/member'

// GET /api/members/[id] - Get single member details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            phone: true,
            company: true,
            position: true,
            bio: true,
            linkedinUrl: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            sentReferrals: true,
            receivedReferrals: true,
            oneOnOneMeetingsAsOne: true,
            oneOnOneMeetingsAsTwo: true,
          },
        },
        ...(user.role === 'ADMIN' && {
          memberships: {
            select: {
              id: true,
              planType: true,
              status: true,
              startDate: true,
              endDate: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        }),
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
    }

    // Flatten profile data
    const member = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: userData.status === 'ACTIVE',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      phone: userData.profile?.phone || null,
      company: userData.profile?.company || null,
      position: userData.profile?.position || null,
      bio: userData.profile?.bio || null,
      linkedinUrl: userData.profile?.linkedinUrl || null,
      _count: userData._count,
      ...('memberships' in userData && { memberships: userData.memberships }),
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json({ error: 'Erro ao buscar membro' }, { status: 500 })
  }
}

// PATCH /api/members/[id] - Update member
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Members can only update themselves, admins can update anyone
    if (user.role !== 'ADMIN' && user.id !== params.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateMemberSchema.parse(body)

    // Separate user fields from profile fields
    const { name, email, role, isActive, phone, company, position, bio, linkedinUrl } =
      validatedData

    const userUpdate: any = {}
    const profileUpdate: any = {}

    if (name) userUpdate.name = name
    if (email) userUpdate.email = email

    // Only admins can change role and status
    if (user.role === 'ADMIN') {
      if (role) userUpdate.role = role
      if (isActive !== undefined) userUpdate.status = isActive ? 'ACTIVE' : 'INACTIVE'
    }

    if (phone !== undefined) profileUpdate.phone = phone
    if (company !== undefined) profileUpdate.company = company
    if (position !== undefined) profileUpdate.position = position
    if (bio !== undefined) profileUpdate.bio = bio
    if (linkedinUrl !== undefined) profileUpdate.linkedinUrl = linkedinUrl

    // Check if email is already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: params.id },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...userUpdate,
        profile: {
          upsert: {
            create: profileUpdate,
            update: profileUpdate,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
        profile: {
          select: {
            phone: true,
            company: true,
            position: true,
            bio: true,
            linkedinUrl: true,
          },
        },
      },
    })

    const member = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.status === 'ACTIVE',
      updatedAt: updatedUser.updatedAt,
      phone: updatedUser.profile?.phone || null,
      company: updatedUser.profile?.company || null,
      position: updatedUser.profile?.position || null,
      bio: updatedUser.profile?.bio || null,
      linkedinUrl: updatedUser.profile?.linkedinUrl || null,
    }

    return NextResponse.json(member)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos', details: error }, { status: 400 })
    }

    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'Erro ao atualizar membro' }, { status: 500 })
  }
}

// DELETE /api/members/[id] - Deactivate member (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Cannot deactivate yourself
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        name: true,
        status: true,
      },
    })

    const member = {
      id: updatedUser.id,
      name: updatedUser.name,
      isActive: updatedUser.status === 'ACTIVE',
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error deactivating member:', error)
    return NextResponse.json({ error: 'Erro ao desativar membro' }, { status: 500 })
  }
}
