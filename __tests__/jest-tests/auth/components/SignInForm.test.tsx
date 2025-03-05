// __Tests__/jest-tests/auth/components/signin-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock pro useLoginForm hook - ponecháme jako v původním fungujícím testu
jest.mock('@/modules/auth/hooks/useLoginForm', () => {
  const mockSetEmail = jest.fn();
  const mockSetPassword = jest.fn();
  const mockToggleVisibility = jest.fn();
  const mockHandleBlurEmail = jest.fn();
  const mockHandleSubmit = jest.fn((e) => e.preventDefault());
  
  return {
    useLoginForm: jest.fn(() => ({
      email: '',
      password: '',
      isVisible: false,
      localErrors: null,
      isInvalidEmail: false,
      isEmptyEmail: true,
      isPending: false,
      state: {},
      setEmail: mockSetEmail,
      setPassword: mockSetPassword,
      toggleVisibility: mockToggleVisibility,
      handleBlurEmail: mockHandleBlurEmail,
      handleSubmit: mockHandleSubmit,
    }))
  };
}, { virtual: true });

// Mock pro AuthHeader komponentu - ponecháme jako v původním fungujícím testu
jest.mock('@/modules/auth/components/auth-header', () => ({
  __esModule: true,
  default: () => <div data-testid="auth-header">Auth Header</div>
}), { virtual: true });

// Import testované komponenty
import SignInForm from '@/modules/auth/components/signin-form';
import { useLoginForm } from '@/modules/auth/hooks/useLoginForm';

describe('SignInForm', () => {
  // Zachováme původní úspěšný test
  test('vykreslí formulář', () => {
    render(<SignInForm />);
    expect(screen.getByTestId('auth-header')).toBeInTheDocument();
  });
  
  // Přidáme test pro kontrolu všech prvků
  test('vykreslí formulář se všemi prvky', () => {
    render(<SignInForm />);
    
    // Kontrola přítomnosti všech klíčových prvků
    expect(screen.getByTestId('auth-header')).toBeInTheDocument();
    expect(screen.getByText(/vítejte zpět/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heslo/i)).toBeInTheDocument();
    expect(screen.getByText(/zapomenuté heslo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  // Přidáme test pro změnu emailu
  test('volá setEmail při změně emailu', async () => {
    render(<SignInForm />);
    
    // Přístup k mockované funkci přímo z hooku
    const hookResult = (useLoginForm as jest.Mock)();
    const mockSetEmail = hookResult.setEmail;
    
    // Najít vstupní pole a změnit jeho hodnotu
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'test@example.com');
    
    // Ověřit, že funkce byla zavolána
    expect(mockSetEmail).toHaveBeenCalled();
  });
});