import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual('@/lib/db')
  return {
    ...actual,
    prisma: (await import('./src/lib/__mocks__/db')).prismaMock,
  }
})

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
