import type { Role } from '@prisma/client'
import { decodeToken, signToken, verifyToken } from '@/lib/auth/jwt'

describe('JWT Utils', () => {
  const mockPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'MEMBER' as Role,
  }

  describe('signToken', () => {
    it('deve gerar um token JWT válido', () => {
      const token = signToken(mockPayload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })
  })

  describe('verifyToken', () => {
    it('deve verificar e decodificar token válido', () => {
      const token = signToken(mockPayload)
      const decoded = verifyToken(token)

      expect(decoded.sub).toBe(mockPayload.sub)
      expect(decoded.email).toBe(mockPayload.email)
      expect(decoded.role).toBe(mockPayload.role)
      expect(decoded.iat).toBeDefined()
      expect(decoded.exp).toBeDefined()
    })

    it('deve rejeitar token inválido', () => {
      const invalidToken = 'token.invalido.aqui'

      expect(() => verifyToken(invalidToken)).toThrow('Token inválido')
    })

    it('deve rejeitar token malformado', () => {
      const malformedToken = 'not-a-token'

      expect(() => verifyToken(malformedToken)).toThrow()
    })
  })

  describe('decodeToken', () => {
    it('deve decodificar token sem verificar', () => {
      const token = signToken(mockPayload)
      const decoded = decodeToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.sub).toBe(mockPayload.sub)
      expect(decoded?.email).toBe(mockPayload.email)
    })

    it('deve retornar null para token inválido', () => {
      const invalidToken = 'not-a-token'
      const decoded = decodeToken(invalidToken)

      expect(decoded).toBeNull()
    })
  })
})
