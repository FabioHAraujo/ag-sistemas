import { applicationSchema } from '@/lib/validators/application'
import { registrationSchema } from '@/lib/validators/registration'

describe('Application Validator', () => {
  it('deve validar dados de candidatura válidos', () => {
    const validData = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      motivation:
        'Quero participar do grupo para expandir minha rede de contatos e gerar novos negócios.',
    }

    const result = applicationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('deve rejeitar candidatura com nome curto', () => {
    const invalidData = {
      name: 'Jo',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      motivation: 'Motivação válida com mais de 50 caracteres para passar na validação.',
    }

    const result = applicationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 3 caracteres')
    }
  })

  it('deve rejeitar candidatura com email inválido', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'email-invalido',
      company: 'Empresa LTDA',
      motivation: 'Motivação válida com mais de 50 caracteres para passar na validação.',
    }

    const result = applicationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Email inválido')
    }
  })

  it('deve rejeitar candidatura com motivação curta', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      motivation: 'Motivação curta',
    }

    const result = applicationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('mínimo 50 caracteres')
    }
  })

  it('deve rejeitar candidatura com motivação muito longa', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Empresa LTDA',
      motivation: 'a'.repeat(1001),
    }

    const result = applicationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('máximo 1000 caracteres')
    }
  })
})

describe('Registration Validator', () => {
  it('deve validar dados de registro válidos', () => {
    const validData = {
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
      phone: '+5511999999999',
      position: 'CEO',
      bio: 'Profissional com 10 anos de experiência em gestão empresarial e networking.',
    }

    const result = registrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('deve rejeitar senha sem letra maiúscula', () => {
    const invalidData = {
      password: 'senha@123',
      confirmPassword: 'senha@123',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('letra maiúscula')
    }
  })

  it('deve rejeitar senha sem letra minúscula', () => {
    const invalidData = {
      password: 'SENHA@123',
      confirmPassword: 'SENHA@123',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('letra minúscula')
    }
  })

  it('deve rejeitar senha sem número', () => {
    const invalidData = {
      password: 'Senha@abc',
      confirmPassword: 'Senha@abc',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('número')
    }
  })

  it('deve rejeitar senha sem caractere especial', () => {
    const invalidData = {
      password: 'Senha123',
      confirmPassword: 'Senha123',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('caractere especial')
    }
  })

  it('deve rejeitar senha muito curta', () => {
    const invalidData = {
      password: 'Sen@1',
      confirmPassword: 'Sen@1',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 8 caracteres')
    }
  })

  it('deve rejeitar quando as senhas não coincidem', () => {
    const invalidData = {
      password: 'Senha@123',
      confirmPassword: 'Senha@456',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('não coincidem')
    }
  })

  it('deve rejeitar formato de telefone inválido', () => {
    const invalidData = {
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
      phone: '123',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Telefone inválido')
    }
  })

  it('deve rejeitar biografia muito curta', () => {
    const invalidData = {
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
      phone: '+5511999999999',
      position: 'CEO',
      bio: 'Bio curta',
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 50 caracteres')
    }
  })

  it('deve rejeitar biografia muito longa', () => {
    const invalidData = {
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
      phone: '+5511999999999',
      position: 'CEO',
      bio: 'a'.repeat(501),
    }

    const result = registrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('máximo 500 caracteres')
    }
  })

  it('deve aceitar registro sem biografia', () => {
    const validData = {
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
      phone: '+5511999999999',
      position: 'CEO',
    }

    const result = registrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
