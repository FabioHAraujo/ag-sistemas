import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

// GET /api/members - List all members (with filters)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active' | 'inactive'
    const role = searchParams.get('role') // 'ADMIN' | 'MEMBER'
    const search = searchParams.get('search') // search by name or email

    const where: any = {}

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { company: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
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
        // Stats for admin
        ...(user.role === 'ADMIN' && {
          _count: {
            select: {
              attendances: true,
              sentReferrals: true,
              receivedReferrals: true,
            },
          },
        }),
      },
      orderBy: { name: 'asc' },
    })

    // Map to flatten profile data
    const members = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.status === 'ACTIVE',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      phone: u.profile?.phone || null,
      company: u.profile?.company || null,
      position: u.profile?.position || null,
      bio: u.profile?.bio || null,
      linkedinUrl: u.profile?.linkedinUrl || null,
      ...('_count' in u && { _count: u._count }),
    }))

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Erro ao buscar membros' }, { status: 500 })
  }
}
