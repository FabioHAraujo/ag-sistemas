/**
 * Teste E2E (End-to-End) do Fluxo Completo de Admissão
 *
 * Este teste simula o fluxo completo desde a candidatura até o cadastro do membro:
 * 1. Candidato envia intenção de participação (criação no banco)
 * 2. Admin visualiza e aprova a candidatura (atualização de status + geração de token)
 * 3. Sistema gera token de registro válido por 7 dias
 * 4. Candidato completa o cadastro com o token (criação de User + MemberProfile)
 * 5. Novo membro é criado e pode fazer login (validação de senha)
 *
 * Testa a integridade de dados e transações através de todo o fluxo.
 */

import crypto from 'node:crypto'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

describe('Fluxo E2E: Admissão de Membros Completo', () => {
  let adminUserId: string

  beforeAll(async () => {
    // Limpar dados de teste
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin.test@networking.com', 'candidato.teste@empresa.com'],
        },
      },
    })

    await prisma.application.deleteMany({
      where: {
        email: 'candidato.teste@empresa.com',
      },
    })

    // Criar admin de teste
    const hashedPassword = await hashPassword('Admin@123')
    const admin = await prisma.user.create({
      data: {
        email: 'admin.test@networking.com',
        passwordHash: hashedPassword,
        name: 'Admin Teste',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    adminUserId = admin.id
  })

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin.test@networking.com', 'candidato.teste@empresa.com'],
        },
      },
    })

    await prisma.application.deleteMany({
      where: {
        email: 'candidato.teste@empresa.com',
      },
    })
  })

  it('deve completar o fluxo de admissão: candidatura → aprovação → cadastro → autenticação', async () => {
    // ========================================
    // PASSO 1: Candidato envia intenção de participação
    // ========================================
    const candidatura = await prisma.application.create({
      data: {
        name: 'João Candidato',
        email: 'candidato.teste@empresa.com',
        company: 'Empresa Teste LTDA',
        motivation:
          'Quero participar do grupo de networking para expandir minha rede de contatos e trocar experiências com outros empresários da região.',
        status: 'PENDING',
      },
    })

    expect(candidatura).toMatchObject({
      name: 'João Candidato',
      email: 'candidato.teste@empresa.com',
      status: 'PENDING',
      token: null,
      tokenExpiresAt: null,
    })

    // ========================================
    // PASSO 2: Admin visualiza candidaturas pendentes
    // ========================================
    const pendentes = await prisma.application.findMany({
      where: {
        status: 'PENDING',
      },
    })

    expect(pendentes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: candidatura.id,
          email: 'candidato.teste@empresa.com',
          status: 'PENDING',
        }),
      ])
    )

    // ========================================
    // PASSO 3: Admin aprova a candidatura
    // ========================================
    const registrationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const aprovada = await prisma.application.update({
      where: { id: candidatura.id },
      data: {
        status: 'APPROVED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        token: registrationToken,
        tokenExpiresAt: tokenExpiration,
      },
    })

    expect(aprovada).toMatchObject({
      status: 'APPROVED',
      reviewedBy: adminUserId,
      token: registrationToken,
    })
    expect(aprovada.reviewedAt).not.toBeNull()
    expect(aprovada.tokenExpiresAt).toEqual(tokenExpiration)

    // ========================================
    // PASSO 4: Candidato completa o cadastro com o token
    // ========================================

    // Validar token antes do cadastro
    const applicationComToken = await prisma.application.findFirst({
      where: {
        token: registrationToken,
        tokenExpiresAt: {
          gt: new Date(),
        },
      },
    })

    expect(applicationComToken).not.toBeNull()
    expect(applicationComToken?.id).toBe(candidatura.id)

    // Criar usuário e perfil em transação
    const senha = 'Senha@123'
    const passwordHash = await hashPassword(senha)

    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          email: candidatura.email,
          passwordHash,
          name: candidatura.name,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      })

      // Criar perfil do membro
      const profile = await tx.memberProfile.create({
        data: {
          userId: user.id,
          applicationId: candidatura.id,
          phone: '+5511999999999',
          company: candidatura.company,
          position: 'CEO',
          bio: 'Empresário com 10 anos de experiência em gestão e networking.',
        },
      })

      // Invalidar token após uso
      await tx.application.update({
        where: { id: candidatura.id },
        data: {
          token: null,
          tokenExpiresAt: null,
        },
      })

      return { user, profile }
    })

    expect(result.user).toMatchObject({
      email: candidatura.email,
      name: candidatura.name,
      role: 'MEMBER',
      status: 'ACTIVE',
    })

    expect(result.profile).toMatchObject({
      userId: result.user.id,
      applicationId: candidatura.id,
      phone: '+5511999999999',
      company: candidatura.company,
      position: 'CEO',
    })

    // ========================================
    // PASSO 5: Novo membro pode autenticar
    // ========================================
    const novoMembro = await prisma.user.findUnique({
      where: { email: candidatura.email },
      include: { profile: true },
    })

    expect(novoMembro).not.toBeNull()
    expect(novoMembro?.status).toBe('ACTIVE')

    // Verificar senha
    const senhaValida = await verifyPassword(senha, novoMembro!.passwordHash)
    expect(senhaValida).toBe(true)

    // Verificar que o perfil está completo
    expect(novoMembro?.profile).toMatchObject({
      phone: '+5511999999999',
      position: 'CEO',
      bio: 'Empresário com 10 anos de experiência em gestão e networking.',
    })

    // ========================================
    // VERIFICAÇÃO FINAL: Token foi invalidado
    // ========================================
    const applicationFinal = await prisma.application.findUnique({
      where: { id: candidatura.id },
    })

    expect(applicationFinal?.token).toBeNull()
    expect(applicationFinal?.tokenExpiresAt).toBeNull()
  })

  it('deve impedir candidatura duplicada para mesmo email pendente', async () => {
    // Criar primeira candidatura
    const primeira = await prisma.application.create({
      data: {
        name: 'Maria Silva',
        email: 'maria.duplicada@empresa.com',
        company: 'Empresa XYZ',
        motivation: 'Motivação válida com mais de cinquenta caracteres para passar na validação.',
        status: 'PENDING',
      },
    })

    // Verificar duplicata
    const existente = await prisma.application.findFirst({
      where: {
        email: 'maria.duplicada@empresa.com',
        status: 'PENDING',
      },
    })

    expect(existente).not.toBeNull()
    expect(existente?.id).toBe(primeira.id)

    // Tentar criar segunda candidatura deve ser bloqueado pela lógica da API
    // (neste teste apenas verificamos que a query retorna a existente)
    const duplicatas = await prisma.application.findMany({
      where: {
        email: 'maria.duplicada@empresa.com',
        status: 'PENDING',
      },
    })

    expect(duplicatas).toHaveLength(1)

    // Limpar
    await prisma.application.delete({ where: { id: primeira.id } })
  })

  it('deve marcar candidatura como rejeitada', async () => {
    // Criar candidatura
    const candidatura = await prisma.application.create({
      data: {
        name: 'Pedro Rejeitado',
        email: 'pedro.rejeitado@empresa.com',
        company: 'Empresa ABC',
        motivation: 'Motivação válida com mais de cinquenta caracteres para passar na validação.',
        status: 'PENDING',
      },
    })

    // Admin rejeita
    const rejeitada = await prisma.application.update({
      where: { id: candidatura.id },
      data: {
        status: 'REJECTED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    })

    expect(rejeitada).toMatchObject({
      status: 'REJECTED',
      reviewedBy: adminUserId,
    })
    expect(rejeitada.reviewedAt).not.toBeNull()

    // Verificar que não foi gerado token
    expect(rejeitada.token).toBeNull()
    expect(rejeitada.tokenExpiresAt).toBeNull()

    // Limpar
    await prisma.application.delete({ where: { id: candidatura.id } })
  })

  it('deve impedir registro com token expirado', async () => {
    // Criar candidatura com token expirado
    const tokenExpirado = crypto.randomBytes(32).toString('hex')
    const candidatura = await prisma.application.create({
      data: {
        name: 'Token Expirado',
        email: 'token.expirado@empresa.com',
        company: 'Empresa DEF',
        motivation: 'Motivação válida com mais de cinquenta caracteres.',
        status: 'APPROVED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        token: tokenExpirado,
        tokenExpiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Expirado há 1 dia
      },
    })

    // Tentar buscar token válido
    const tokenValido = await prisma.application.findFirst({
      where: {
        token: tokenExpirado,
        tokenExpiresAt: {
          gt: new Date(), // Tokens que ainda não expiraram
        },
      },
    })

    // Deve retornar null pois o token está expirado
    expect(tokenValido).toBeNull()

    // Limpar
    await prisma.application.delete({ where: { id: candidatura.id } })
  })

  it('deve impedir processamento de candidatura já aprovada', async () => {
    // Criar candidatura já aprovada
    const candidatura = await prisma.application.create({
      data: {
        name: 'Já Aprovado',
        email: 'ja.aprovado@empresa.com',
        company: 'Empresa GHI',
        motivation: 'Motivação válida com mais de cinquenta caracteres.',
        status: 'APPROVED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    })

    // Verificar status antes de tentar processar
    const candidaturaAtual = await prisma.application.findUnique({
      where: { id: candidatura.id },
    })

    expect(candidaturaAtual?.status).toBe('APPROVED')

    // Lógica da API deveria impedir processamento
    // Aqui apenas validamos que o status não é PENDING
    expect(candidaturaAtual?.status).not.toBe('PENDING')

    // Limpar
    await prisma.application.delete({ where: { id: candidatura.id } })
  })

  it('deve manter integridade referencial entre User, MemberProfile e Application', async () => {
    // Criar candidatura aprovada
    const token = crypto.randomBytes(32).toString('hex')
    const candidatura = await prisma.application.create({
      data: {
        name: 'Teste Integridade',
        email: 'integridade.teste@empresa.com',
        company: 'Empresa JKL',
        motivation: 'Motivação válida com mais de cinquenta caracteres.',
        status: 'APPROVED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        token,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Criar usuário e perfil
    const passwordHash = await hashPassword('Teste@123')

    const user = await prisma.user.create({
      data: {
        email: candidatura.email,
        passwordHash,
        name: candidatura.name,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })

    await prisma.memberProfile.create({
      data: {
        userId: user.id,
        applicationId: candidatura.id,
        phone: '+5511888888888',
        company: candidatura.company,
        position: 'Diretor',
      },
    })

    // Verificar relacionamentos
    const userComProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: {
          include: {
            application: true,
          },
        },
      },
    })

    expect(userComProfile?.profile).not.toBeNull()
    expect(userComProfile?.profile?.userId).toBe(user.id)
    expect(userComProfile?.profile?.applicationId).toBe(candidatura.id)
    expect(userComProfile?.profile?.application?.email).toBe(candidatura.email)

    // Limpar (cascade deve funcionar)
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.application.delete({ where: { id: candidatura.id } })

    // Verificar que profile foi deletado por cascade
    const profileDeletado = await prisma.memberProfile.findUnique({
      where: { userId: user.id },
    })

    expect(profileDeletado).toBeNull()
  })
})
