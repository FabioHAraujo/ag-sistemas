import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

/**
 * Cria hash de uma senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verifica se uma senha corresponde ao hash armazenado
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
