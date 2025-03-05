/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import SignIn from '@/app/(auth)/signin/page'; // upravte cestu dle struktury projektu
import { useRouter, useSearchParams } from 'next/navigation';

// --- Mockování Next.js hooků ---
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: () => [{}, jest.fn(), false],
  };
});

describe('SignIn page', () => {
  beforeEach(() => {
    // Nastavte návratové hodnoty pro Next.js hooky
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('redirect=/dashboard'));
    pushMock.mockClear();
  });

  test('renders all expected elements', () => {
    render(<SignIn />);
    // Nadpis
    expect(screen.getByText(/Vítejte zpět/i)).toBeInTheDocument();

    // Formulářové vstupy
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heslo/i)).toBeInTheDocument();

    // Tlačítko pro přihlášení
    expect(screen.getByTestId('login-button')).toBeInTheDocument();

    // Odkaz pro reset hesla
    expect(screen.getByText(/Zapomenuté heslo\?/i)).toBeInTheDocument();
    
    // Pokud je modal skrytý při testech, můžete očekávat, že nebude v dokumentu.
    expect(screen.queryByText(/Informace o cookies/i)).not.toBeInTheDocument();
  });
});
