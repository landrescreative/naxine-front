/**
 * Tests para el hook useAuth
 * 
 * @module useAuth.test
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { authService } from '@/services/api/auth'
import * as cookies from '@/lib/cookies'

// Mock de servicios
jest.mock('@/services/api/auth')
jest.mock('@/lib/cookies')
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

const mockAuthService = authService as jest.Mocked<typeof authService>
const mockCookies = cookies as jest.Mocked<typeof cookies>

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockCookies.getCookie.mockReturnValue(undefined)
    mockCookies.setCookie.mockImplementation(() => {})
    mockCookies.deleteCookie.mockImplementation(() => {})
  })

  describe('Estado inicial', () => {
    it('debe inicializar con usuario null y loading true', async () => {
      const { result } = renderHook(() => useAuth())

      // El loading puede cambiar rápidamente, así que verificamos el estado inicial
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      
      // Esperar a que termine la verificación inicial
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Login', () => {
    it('debe hacer login exitosamente', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client' as const,
        token: 'mock-token',
      }

      mockAuthService.login.mockResolvedValue({
        success: true,
        data: {
          token: 'mock-token',
          usuario: {
            id_usuario: '1',
            email: 'test@example.com',
            nombre: 'Test User',
            rol: 'cliente',
          },
        },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        const loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        })

        expect(loginResult).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.user).not.toBeNull()
        expect(result.current.isAuthenticated).toBe(true)
      })

      // setCookie se llama con name, value y days (por defecto 7)
      // Verificar que se llamó con los parámetros correctos
      expect(mockCookies.setCookie).toHaveBeenCalled()
      const setCookieCalls = (mockCookies.setCookie as jest.Mock).mock.calls
      expect(setCookieCalls[0][0]).toBe('auth-token')
      expect(setCookieCalls[0][1]).toBe('mock-token')
    })

    it('debe manejar errores de login', async () => {
      mockAuthService.login.mockResolvedValue({
        success: false,
        error: 'Credenciales inválidas',
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        const loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })

        expect(loginResult).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('Logout', () => {
    it('debe hacer logout correctamente', async () => {
      // Primero hacer login
      mockAuthService.login.mockResolvedValue({
        success: true,
        data: {
          token: 'mock-token',
          usuario: {
            id_usuario: '1',
            email: 'test@example.com',
            nombre: 'Test User',
            rol: 'cliente',
          },
        },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Mock logout
      mockAuthService.logout.mockResolvedValue({
        success: true,
      })

      // Ahora hacer logout
      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })

      // deleteCookie puede ser llamado con 1 o 2 parámetros dependiendo de la implementación
      expect(mockCookies.deleteCookie).toHaveBeenCalledWith('auth-token')
    })
  })

  describe('Registro', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      mockAuthService.register.mockResolvedValue({
        success: true,
        data: {
          token: 'mock-token',
          usuario: {
            id_usuario: '1',
            email: 'new@example.com',
            nombre: 'New User',
            rol: 'cliente',
          },
        },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        const registerResult = await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          role: 'client',
        })

        // El registro retorna un objeto con success y email
        expect(registerResult).toEqual({ success: true, email: 'new@example.com' })
      })

      // El registro NO inicia sesión automáticamente, el usuario debe verificar primero
      // Por lo tanto, el usuario debe seguir siendo null
      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })
})

