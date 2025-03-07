// __tests__/jest-tests/auth/actions/logout.test.ts

// Mockování modulů musí být před importem
jest.mock('@/app/lib/session', () => ({
    deleteSession: jest.fn().mockResolvedValue(undefined),
  }));
  
  jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
  }));
  
  // Import až po mockování
  import { logout } from '@/actions/auth/logout';
  import { deleteSession } from '@/app/lib/session';
  import { redirect } from 'next/navigation';
  
  describe('logout server action', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should delete the session and redirect to signin page', async () => {
      // When
      await logout();
  
      // Then
      expect(deleteSession).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith('/signin');
    });
  
    it('should handle errors during session deletion and log to console', async () => {
      // Given
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Session deletion failed');
      (deleteSession as jest.Mock).mockRejectedValueOnce(error);
  
      // When
      await logout();
  
      // Then
      expect(deleteSession).toHaveBeenCalledTimes(1);
      expect(redirect).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error during logout:", error);
  
      consoleErrorSpy.mockRestore();
    });
  });
  