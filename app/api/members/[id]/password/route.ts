import bcrypt from 'bcrypt'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'
import { updatePasswordSchema } from '@/lib/validators/member'

// PATCH /api/members/[id]/password - Update member password
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Members can only change their own password
    if (user.id !== id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updatePasswordSchema.parse(body)

    // Get current user with password
    const userData = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    })

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      userData.passwordHash
    )

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    })

    return NextResponse.json({ message: 'Senha atualizada com sucesso' })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos', details: error }, { status: 400 })
    }

    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Erro ao atualizar senha' }, { status: 500 })
  }
}
