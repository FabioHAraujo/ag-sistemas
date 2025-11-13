import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@networking.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'
  const name = 'Administrador'

  // Verificar se já existe
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log(`✅ Admin já existe: ${email}`)
    return
  }

  // Criar admin
  const passwordHash = await hashPassword(password)
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Admin criado com sucesso!`)
  console.log(`   Email: ${admin.email}`)
  console.log(`   Senha: ${password}`)
  console.log(`   Role: ${admin.role}`)
}

main()
  .catch((error) => {
    console.error('❌ Erro ao criar admin:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
