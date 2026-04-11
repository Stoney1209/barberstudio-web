import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
;(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder

if (!global.fetch) {
  const undici = require('undici')
  ;(global as unknown as { fetch: typeof fetch }).fetch = undici.fetch
  ;(global as unknown as { Request: typeof Request }).Request = undici.Request
  ;(global as unknown as { Response: typeof Response }).Response = undici.Response
  ;(global as unknown as { Headers: typeof Headers }).Headers = undici.Headers
}

const appointmentMock = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  groupBy: jest.fn(),
}

const serviceMock = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}

const userMock = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}

const availabilityMock = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  count: jest.fn(),
  upsert: jest.fn(),
}

const reviewMock = {
  findMany: jest.fn(),
  create: jest.fn(),
}

const galleryMock = {
  findMany: jest.fn(),
  create: jest.fn(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: appointmentMock,
    service: serviceMock,
    user: userMock,
    availability: availabilityMock,
    review: reviewMock,
    gallery: galleryMock,
    $queryRaw: jest.fn(),
    $transaction: jest.fn(
      async (
        cb: (tx: {
          appointment: typeof appointmentMock
          $executeRawUnsafe: jest.Mock
        }) => Promise<unknown>
      ) =>
        cb({
          appointment: {
            findFirst: appointmentMock.findFirst,
            create: appointmentMock.create,
          },
          $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
        })
    ),
    $disconnect: jest.fn(),
  },
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null,
        }),
      },
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
      },
    })),
  createBrowserClient: jest.fn(() => ({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user-id' } } }, error: null }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    })),
}))
