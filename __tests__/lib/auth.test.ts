import { createSession, getSession, clearSession, SessionUser } from '@/lib/auth'
import { cookies } from 'next/headers'

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Auth Functions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    warName: 'TestUser',
    isAdmin: false,
    password: 'hashed-password',
    rank: 'Soldado',
    phone: '11987654321',
    total: 0,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCookieStore = {
    set: jest.fn(),
    get: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(cookies as jest.Mock).mockResolvedValue(mockCookieStore)
  })

  describe('createSession', () => {
    it('should create a session cookie with valid user data', async () => {
      await createSession(mockUser)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'inventory_session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        })
      )
    })

    it('should encode session data as base64', async () => {
      await createSession(mockUser)

      const callArgs = mockCookieStore.set.mock.calls[0]
      const encodedData = callArgs[1]

      const decodedData = JSON.parse(
        Buffer.from(encodedData, 'base64').toString()
      )
      expect(decodedData).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        warName: mockUser.warName,
        isAdmin: mockUser.isAdmin,
      })
    })

    it('should set secure cookie in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      await createSession(mockUser)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          secure: true,
        })
      )

      process.env.NODE_ENV = originalEnv
    })

    it('should set non-secure cookie in development', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      await createSession(mockUser)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          secure: false,
        })
      )

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('getSession', () => {
    it('should return null if no session cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should return null if session cookie has no value', async () => {
      mockCookieStore.get.mockReturnValue({ value: '' })

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should decode and return valid session data', async () => {
      const sessionData = {
        id: mockUser.id,
        email: mockUser.email,
        warName: mockUser.warName,
        isAdmin: mockUser.isAdmin,
      }

      const encodedData = Buffer.from(JSON.stringify(sessionData)).toString(
        'base64'
      )
      mockCookieStore.get.mockReturnValue({ value: encodedData })

      const session = await getSession()

      expect(session).toEqual(sessionData)
    })

    it('should return null if session data is corrupted', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'corrupted-data' })

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should return null if required fields are missing', async () => {
      const incompleteData = {
        id: mockUser.id,
        email: mockUser.email,
        // warName is missing
      }

      const encodedData = Buffer.from(JSON.stringify(incompleteData)).toString(
        'base64'
      )
      mockCookieStore.get.mockReturnValue({ value: encodedData })

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should return null if isAdmin is not boolean', async () => {
      const invalidData = {
        id: mockUser.id,
        email: mockUser.email,
        warName: mockUser.warName,
        isAdmin: 'yes', // Should be boolean
      }

      const encodedData = Buffer.from(JSON.stringify(invalidData)).toString(
        'base64'
      )
      mockCookieStore.get.mockReturnValue({ value: encodedData })

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should validate all required fields', async () => {
      const testCases = [
        { id: null, email: mockUser.email, warName: mockUser.warName, isAdmin: false },
        { id: mockUser.id, email: null, warName: mockUser.warName, isAdmin: false },
        { id: mockUser.id, email: mockUser.email, warName: null, isAdmin: false },
        { id: mockUser.id, email: mockUser.email, warName: mockUser.warName, isAdmin: null },
      ]

      for (const testCase of testCases) {
        const encodedData = Buffer.from(JSON.stringify(testCase)).toString(
          'base64'
        )
        mockCookieStore.get.mockReturnValue({ value: encodedData })

        const session = await getSession()
        expect(session).toBeNull()
      }
    })
  })

  describe('clearSession', () => {
    it('should clear the session cookie', async () => {
      await clearSession()

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'inventory_session',
        '',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 0,
        })
      )
    })

    it('should set secure cookie in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      await clearSession()

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          secure: true,
        })
      )

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Session Type', () => {
    it('should have correct SessionUser type', async () => {
      const sessionUser: SessionUser = {
        id: 'test-id',
        email: 'test@example.com',
        warName: 'TestWar',
        isAdmin: true,
      }

      expect(sessionUser.id).toBe('test-id')
      expect(sessionUser.email).toBe('test@example.com')
      expect(sessionUser.warName).toBe('TestWar')
      expect(sessionUser.isAdmin).toBe(true)
    })
  })
})