import { randomBytes } from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma'

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()

    const { id } = params

    // Verificar se application existe
    const application = await prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: 'Intenção não encontrada' }, { status: 404 })
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json({ error: 'Esta intenção já foi processada' }, { status: 400 })
    }

    // Gerar token único de registro (válido por 7 dias)
    const token = randomBytes(32).toString('hex')
    const tokenExpiresAt = new Date()
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7)

    // Atualizar application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        token,
        tokenExpiresAt,
      },
    })

    // Gerar link de registro
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const registrationLink = `${appUrl}/register?token=${token}`

    // Mock de envio de email (apenas console.log)
    console.log('='.repeat(80))
    console.log('📧 EMAIL DE CONVITE')
    console.log('='.repeat(80))
    console.log(`Para: ${application.email}`)
    console.log(`Nome: ${application.name}`)
    console.log(`Assunto: Você foi aprovado no Grupo de Networking!`)
    console.log('')
    console.log('Parabéns! Sua intenção foi aprovada.')
    console.log(`Complete seu cadastro em: ${registrationLink}`)
    console.log(`Link válido até: ${tokenExpiresAt.toLocaleDateString('pt-BR')}`)
    console.log('='.repeat(80))

    return NextResponse.json({
      message: 'Intenção aprovada com sucesso',
      application: updatedApplication,
      registrationLink, // Para facilitar testes
    })
  } catch (error) {
    console.error('Application approval error:', error)
    return NextResponse.json({ error: 'Erro ao aprovar intenção' }, { status: 500 })
  }
}
