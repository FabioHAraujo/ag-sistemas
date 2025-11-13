// Mock para Jest (não Vitest)
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}))

export const useSearchParams = jest.fn(() => ({
  get: jest.fn(),
}))

export const usePathname = jest.fn(() => '/')
