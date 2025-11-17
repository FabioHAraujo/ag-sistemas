#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando associações de exemplo...')

  // Buscar todos os usuários
  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (users.length === 0) {
    console.log('❌ Nenhum usuário encontrado. Execute primeiro o seed de usuários.')
    return
  }

  console.log(`✓ Encontrados ${users.length} usuários`)

  // Criar associações para todos os usuários
  const startDate = new Date()
  startDate.setDate(1) // Primeiro dia do mês atual

  const endDate = new Date()
  endDate.setFullYear(endDate.getFullYear() + 1) // 1 ano de validade

  const planTypes = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const
  const amounts = {
    MONTHLY: 100,
    QUARTERLY: 270, // 10% de desconto
    ANNUAL: 1080, // 10% de desconto
  }

  let created = 0

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const planType = planTypes[i % planTypes.length]

    // Verificar se já tem associação ativa
    const existing = await prisma.membership.findFirst({
      where: {
        memberId: user.id,
        status: 'ACTIVE',
      },
    })

    if (existing) {
      console.log(`  ⊙ ${user.name} já possui associação ativa`)
      continue
    }

    await prisma.membership.create({
      data: {
        memberId: user.id,
        planType,
        amount: amounts[planType],
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    })

    created++
    console.log(`  ✓ Criada associação ${planType} para ${user.name} (R$ ${amounts[planType]})`)
  }

  console.log(`\n✅ ${created} associação(ões) criada(s) com sucesso!`)
  console.log('\nAgora você pode gerar cobranças em /admin/payments')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
