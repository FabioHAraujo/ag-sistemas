import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPayments() {
  try {
    console.log('🔍 Buscando membros ativos...')

    // Buscar todos os membros ativos
    const members = await prisma.user.findMany({
      where: {
        role: 'MEMBER',
        status: 'ACTIVE',
      },
      take: 5, // Pegar até 5 membros
    })

    if (members.length === 0) {
      console.log('❌ Nenhum membro ativo encontrado. Execute o seed primeiro.')
      return
    }

    console.log(`✅ Encontrados ${members.length} membro(s) ativo(s)`)

    for (const member of members) {
      console.log(`\n📝 Criando mensalidade e pagamentos para: ${member.name}`)

      // Criar mensalidade
      const membership = await prisma.membership.create({
        data: {
          memberId: member.id,
          planType: 'MONTHLY',
          amount: 250.0,
          startDate: new Date('2025-01-01'),
          status: 'ACTIVE',
        },
      })

      console.log(`  ✅ Mensalidade criada: ${membership.planType}`)

      // Criar 3 pagamentos: 1 pago, 1 pendente, 1 vencido
      const now = new Date()

      // Pagamento pago (mês passado)
      const _paidPayment = await prisma.payment.create({
        data: {
          membershipId: membership.id,
          memberId: member.id,
          amount: 250.0,
          dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
          paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 8),
          status: 'PAID',
          paymentMethod: 'PIX',
          transactionId: `PIX-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
      })
      console.log(`  ✅ Pagamento PAGO criado`)

      // Pagamento pendente (mês atual)
      const _pendingPayment = await prisma.payment.create({
        data: {
          membershipId: membership.id,
          memberId: member.id,
          amount: 250.0,
          dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
          status: 'PENDING',
        },
      })
      console.log(`  ✅ Pagamento PENDENTE criado`)

      // Pagamento vencido (há 2 meses)
      const _overduePayment = await prisma.payment.create({
        data: {
          membershipId: membership.id,
          memberId: member.id,
          amount: 250.0,
          dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 10),
          status: 'OVERDUE',
        },
      })
      console.log(`  ✅ Pagamento VENCIDO criado`)
    }

    console.log('\n✅ Dados de teste criados com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPayments()
