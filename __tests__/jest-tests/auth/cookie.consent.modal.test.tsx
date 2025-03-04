/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CookieConsentModal from '@/modules/auth/components/cookie-consent-modal';



describe('CookieConsentModal', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Obnovíme původní hodnotu a vyčistíme localStorage
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: originalEnv },
      writable: true,
    });
    localStorage.clear();
  });

  test('v testovacím prostředí modal se nespustí (je skrytý)', () => {
    // Přepišeme NODE_ENV na "test"
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: 'test' },
      writable: true,
    });
    
    render(<CookieConsentModal />);
    // V testovacím režimu by modal měl být skrytý
    expect(screen.queryByText(/Informace o cookies/i)).not.toBeInTheDocument();
  });

  test('v ne-testovacím prostředí modal se zobrazí a po kliknutí se skryje', async () => {
    // Přepišeme NODE_ENV na "development"
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: 'development' },
      writable: true,
    });
    localStorage.removeItem('cookieConsent');
    
    render(<CookieConsentModal />);
    
    // Ověříme, že modal se zobrazí (pokud obsahuje text "Informace o cookies")
    const modalText = await screen.findByText(/Informace o cookies/i);
    expect(modalText).toBeInTheDocument();
    
    // Najdeme tlačítko a klikneme
    const acceptButton = screen.getByRole('button', { name: /Rozumím/i });
    fireEvent.click(acceptButton);
    
    // Ověříme, že se do localStorage uloží hodnota "true"
    await waitFor(() => {
      expect(localStorage.getItem('cookieConsent')).toBe("true");
    });
    
    // Ověříme, že modal již není viditelný
    await waitFor(() => {
      expect(screen.queryByText(/Informace o cookies/i)).not.toBeInTheDocument();
    });
  });
});
