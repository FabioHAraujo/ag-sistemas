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

    // Atualizar application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    })

    // Mock de envio de email (apenas console.log)
    console.log('='.repeat(80))
    console.log('📧 EMAIL DE REJEIÇÃO')
    console.log('='.repeat(80))
    console.log(`Para: ${application.email}`)
    console.log(`Nome: ${application.name}`)
    console.log(`Assunto: Sobre sua intenção de participação`)
    console.log('')
    console.log('Obrigado pelo interesse em participar do nosso grupo de networking.')
    console.log('Infelizmente, não poderemos prosseguir com sua participação neste momento.')
    console.log('='.repeat(80))

    return NextResponse.json({
      message: 'Intenção rejeitada',
      application: updatedApplication,
    })
  } catch (error) {
    console.error('Application rejection error:', error)
    return NextResponse.json({ error: 'Erro ao rejeitar intenção' }, { status: 500 })
  }
}
