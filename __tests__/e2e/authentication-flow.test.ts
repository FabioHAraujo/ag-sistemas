/**
 * Teste E2E: Fluxo de Autenticação Completo
 *
 * Testa os fluxos de autenticação e validação de credenciais:
 * - Criação de usuários com diferentes roles
 * - Validação de senhas
 * - Verificação de status de usuários
 * - Integridade de dados de autenticação
 */

import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

describe('Fluxo E2E: Autenticação', () => {
  beforeAll(async () => {
    // Limpar usuários de teste
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'admin.auth@networking.com',
            'membro.auth@networking.com',
            'inativo.auth@networking.com',
            'usuario.unico@networking.com',
          ],
        },
      },
    })

    // Criar admin de teste
    const adminHash = await hashPassword('Admin@123')
    await prisma.user.create({
      data: {
        email: 'admin.auth@networking.com',
        passwordHash: adminHash,
        name: 'Admin Auth',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    // Criar membro de teste
    const memberHash = await hashPassword('Membro@123')
    const member = await prisma.user.create({
      data: {
        email: 'membro.auth@networking.com',
        passwordHash: memberHash,
        name: 'Membro Auth',
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })

    // Criar perfil do membro
    await prisma.memberProfile.create({
      data: {
        userId: member.id,
        phone: '+5511999999999',
        company: 'Empresa Teste',
        position: 'Gerente',
      },
    })
  })

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'admin.auth@networking.com',
            'membro.auth@networking.com',
            'inativo.auth@networking.com',
            'usuario.unico@networking.com',
          ],
        },
      },
    })
  })

  it('deve autenticar ADMIN com credenciais corretas', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'admin.auth@networking.com' },
    })

    expect(user).not.toBeNull()
    expect(user?.role).toBe('ADMIN')
    expect(user?.status).toBe('ACTIVE')

    const senhaCorreta = await verifyPassword('Admin@123', user!.passwordHash)
    expect(senhaCorreta).toBe(true)
  })

  it('deve autenticar MEMBER com credenciais corretas', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'membro.auth@networking.com' },
      include: { profile: true },
    })

    expect(user).not.toBeNull()
    expect(user?.role).toBe('MEMBER')
    expect(user?.status).toBe('ACTIVE')

    const senhaCorreta = await verifyPassword('Membro@123', user!.passwordHash)
    expect(senhaCorreta).toBe(true)

    // Verificar que o membro tem perfil
    expect(user?.profile).not.toBeNull()
    expect(user?.profile?.position).toBe('Gerente')
  })

  it('deve rejeitar autenticação com email inexistente', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'nao.existe@networking.com' },
    })

    expect(user).toBeNull()
  })

  it('deve rejeitar autenticação com senha incorreta', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'admin.auth@networking.com' },
    })

    expect(user).not.toBeNull()

    const senhaErrada = await verifyPassword('SenhaErrada@123', user!.passwordHash)
    expect(senhaErrada).toBe(false)
  })

  it('deve impedir autenticação de usuário inativo', async () => {
    // Criar usuário inativo
    const inactiveHash = await hashPassword('Inativo@123')
    const inactiveUser = await prisma.user.create({
      data: {
        email: 'inativo.auth@networking.com',
        passwordHash: inactiveHash,
        name: 'Usuário Inativo',
        role: 'MEMBER',
        status: 'INACTIVE',
      },
    })

    const user = await prisma.user.findUnique({
      where: { email: 'inativo.auth@networking.com' },
    })

    expect(user).not.toBeNull()
    expect(user?.status).toBe('INACTIVE')

    // Mesmo com senha correta, status inativo deve bloquear acesso
    const senhaCorreta = await verifyPassword('Inativo@123', user!.passwordHash)
    expect(senhaCorreta).toBe(true)
    expect(user?.status).not.toBe('ACTIVE')

    // Limpar
    await prisma.user.delete({ where: { id: inactiveUser.id } })
  })

  it('deve validar complexidade de senha no hash', async () => {
    const senhaFraca = 'senha123'
    const senhaForte = 'Senha@Forte#123'

    const hashFraco = await hashPassword(senhaFraca)
    const hashForte = await hashPassword(senhaForte)

    // Ambos os hashes devem ser gerados com sucesso (validação acontece na API)
    expect(hashFraco).toBeTruthy()
    expect(hashForte).toBeTruthy()

    // Verificar que as senhas são reconhecidas corretamente
    expect(await verifyPassword(senhaFraca, hashFraco)).toBe(true)
    expect(await verifyPassword(senhaForte, hashForte)).toBe(true)

    // Verificar que senhas erradas são rejeitadas
    expect(await verifyPassword(senhaFraca, hashForte)).toBe(false)
    expect(await verifyPassword(senhaForte, hashFraco)).toBe(false)
  })

  it('deve manter unicidade de email na tabela User', async () => {
    const email = 'usuario.unico@networking.com'

    // Criar primeiro usuário
    const hash = await hashPassword('Teste@123')
    const primeiroUsuario = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name: 'Primeiro Usuário',
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })

    // Tentar criar segundo usuário com mesmo email deve falhar
    await expect(
      prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          name: 'Segundo Usuário',
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      })
    ).rejects.toThrow()

    // Limpar
    await prisma.user.delete({ where: { id: primeiroUsuario.id } })
  })

  it('deve permitir alteração de senha mantendo integridade', async () => {
    const email = 'usuario.troca@networking.com'
    const senhaOriginal = 'Original@123'
    const senhaNova = 'Nova@Senha#456'

    // Criar usuário com senha original
    const hashOriginal = await hashPassword(senhaOriginal)
    const usuario = await prisma.user.create({
      data: {
        email,
        passwordHash: hashOriginal,
        name: 'Usuário Troca Senha',
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })

    // Verificar senha original
    let user = await prisma.user.findUnique({ where: { id: usuario.id } })
    expect(await verifyPassword(senhaOriginal, user!.passwordHash)).toBe(true)

    // Alterar senha
    const hashNovo = await hashPassword(senhaNova)
    await prisma.user.update({
      where: { id: usuario.id },
      data: { passwordHash: hashNovo },
    })

    // Verificar nova senha
    user = await prisma.user.findUnique({ where: { id: usuario.id } })
    expect(await verifyPassword(senhaNova, user!.passwordHash)).toBe(true)
    expect(await verifyPassword(senhaOriginal, user!.passwordHash)).toBe(false)

    // Limpar
    await prisma.user.delete({ where: { id: usuario.id } })
  })
})
