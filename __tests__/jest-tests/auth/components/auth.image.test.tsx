import AuthImage from '@/modules/auth/components/auth-image';
import { render, screen } from '@testing-library/react';


describe('AuthImage', () => {
  test('Zobrazí obrázek s alternativním textem', () => {
    render(<AuthImage />);

    // Ověří, že se obrázek zobrazil
    const imageElement = screen.getByRole("img", { name: /authpic/i, hidden: true });
    expect(imageElement).toBeInTheDocument();

    // Ověří, že obrázek má správný alternativní text (alt)
    expect(imageElement).toHaveAttribute('alt', 'authpic'); // Opravený alt text

  });

});