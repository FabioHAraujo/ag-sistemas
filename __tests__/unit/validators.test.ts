import { applicationSchema } from '@/lib/validators/application'
import { registrationSchema } from '@/lib/validators/registration'

describe('Application Validator', () => {
  it('should validate valid application data', () => {
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

  it('should reject application with short name', () => {
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

  it('should reject application with invalid email', () => {
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

  it('should reject application with short motivation', () => {
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

  it('should reject application with motivation too long', () => {
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
  it('should validate valid registration data', () => {
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

  it('should reject password without uppercase', () => {
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

  it('should reject password without lowercase', () => {
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

  it('should reject password without number', () => {
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

  it('should reject password without special character', () => {
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

  it('should reject password too short', () => {
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

  it('should reject when passwords do not match', () => {
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

  it('should reject invalid phone format', () => {
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

  it('should reject bio too short', () => {
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

  it('should reject bio too long', () => {
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

  it('should accept registration without bio', () => {
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
