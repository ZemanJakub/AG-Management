// __tests__/jest-tests/auth/lib/session.test.ts

import { createSession, deleteSession, encrypt, decrypt } from 'app/lib/session';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { DataForSession } from '@/app/lib/models';

// Mockování next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mockování jose
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked-jwt-token'),
  })),
  jwtVerify: jest.fn(),
}));

// Mockování process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv, SESSION_SECRET: '1234567890' };
});


afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe('Session management', () => {
  describe('createSession', () => {
    it('should create a session and set it as a cookie', async () => {
      // Given
      const mockData: DataForSession = {
        id: '123',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        avatar: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires: null,
        expires_at: null,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };

      const mockCookiesSet = jest.fn();
      const mockCookies = {
        set: mockCookiesSet,
      };
      (cookies as unknown as jest.Mock).mockResolvedValue(mockCookies);
      
      // Mock pro encrypt funkci
      jest.spyOn(global.Date, 'now').mockReturnValue(1000000); // Mock času
      jest.spyOn({ encrypt } as any, 'encrypt').mockResolvedValue('mocked-jwt-token');

      // When
      await createSession(mockData);

      // Then
      expect(mockCookiesSet).toHaveBeenCalledWith(
        'session',
        'mocked-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          expires: expect.any(Date),
        })
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete the session cookie', async () => {
      // Given
      const mockCookiesDelete = jest.fn();
      const mockCookies = {
        delete: mockCookiesDelete,
      };
      (cookies as unknown as jest.Mock).mockResolvedValue(mockCookies);

      // When
      await deleteSession();

      // Then
      expect(mockCookiesDelete).toHaveBeenCalledWith('session');
    });
  });

  describe('encrypt', () => {
    it('should create and sign a JWT token', async () => {
      // Given
      const mockData: DataForSession = {
        id: '123',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        avatar: null,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires: null,
        expires_at: null,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };

      // When
      await encrypt(mockData);

      // Then
      expect(SignJWT).toHaveBeenCalledWith({ payload: mockData });
      const mockInstance = (SignJWT as jest.Mock).mock.results[0].value;
      expect(mockInstance.setProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' });
      expect(mockInstance.setIssuedAt).toHaveBeenCalled();
      expect(mockInstance.setExpirationTime).toHaveBeenCalledWith('8hr');
      expect(mockInstance.sign).toHaveBeenCalled();
    });
  });

  describe('decrypt', () => {
    it('should return null if no session provided', async () => {
      // When
      const result = await decrypt();

      // Then
      expect(result).toBeNull();
      expect(jwtVerify).not.toHaveBeenCalled();
    });

    it('should return payload if session is valid', async () => {
        // Given
        const mockPayload = {
          payload: {
            id: '123',
            email: 'test@example.com',
          },
        };
        (jwtVerify as jest.Mock).mockResolvedValue(mockPayload);
      
        // When
        const result = await decrypt('valid-session-token');
      
        // Then
        // Použijeme volnější kontrolu
        expect(jwtVerify).toHaveBeenCalled();
        const callArgs = (jwtVerify as jest.Mock).mock.calls[0];
        expect(callArgs[0]).toBe('valid-session-token');
        expect(callArgs[1]).toEqual(new TextEncoder().encode('1234567890')); // check correct key
        expect(callArgs[2]).toEqual({ algorithms: ['HS256'] });
        
        // A zkontrolujeme výsledek
        expect(result).toEqual(mockPayload.payload); // Return only payload data
      });

    it('should return null if session verification fails', async () => {
      // Given
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      // When
      const result = await decrypt('invalid-token');

      // Then
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to verify session:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should return null if session has expired', async () => {
      // Given
      const mockPayload = {
        payload: {
          expiresAt: Date.now() - 1000, // Již expirovaný
        },
      };
      (jwtVerify as jest.Mock).mockResolvedValue(mockPayload);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // When
      const result = await decrypt('expired-token');

      // Then
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to verify session:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
