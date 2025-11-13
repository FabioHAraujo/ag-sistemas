import { hashPassword, verifyPassword } from '@/lib/auth/password'

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('deve criar um hash válido', async () => {
      const password = 'SenhaSegura123!'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
    })

    it('deve criar hashes diferentes para a mesma senha', async () => {
      const password = 'SenhaSegura123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('deve verificar senha correta', async () => {
      const password = 'SenhaSegura123!'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('deve rejeitar senha incorreta', async () => {
      const password = 'SenhaSegura123!'
      const wrongPassword = 'SenhaErrada456!'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })
  })
})
