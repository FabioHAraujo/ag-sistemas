import { vi } from 'vitest'

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}))

export const useSearchParams = vi.fn(() => ({
  get: vi.fn(),
}))

export const usePathname = vi.fn(() => '/')
