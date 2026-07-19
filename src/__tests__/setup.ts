import { configure } from '@testing-library/dom'

// Setup file for Vitest tests
configure({ testIdAttribute: 'data-testid' })

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock next/third-parties
jest.mock('next/third-parties', () => ({
  GoogleAnalytics: () => null,
}))
