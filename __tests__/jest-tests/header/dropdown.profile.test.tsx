import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownProfile from '@/components/default-components/dropdown-profile';
import { logout } from '@/actions';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: { src: string; alt: string, width: number, height: number, className: string }) => (
    <img src={src} alt={alt} width={width} height={height} className={className} data-testid="mocked-image" />
  ),
}));

// Mock the logout function
jest.mock('@/actions', () => ({
  logout: jest.fn(),
}));

describe('DropdownProfile', () => {
  const mockUserName = 'Test User';
  const mockAvatar = 'test-avatar.jpg';

  it('renders user name and avatar', () => {
    render(<DropdownProfile userName={mockUserName} avatar={mockAvatar} />);

    const userButton = screen.getByRole('button');
    expect(userButton).toBeInTheDocument();

    const userNameSpan = screen.getByText(mockUserName);
    expect(userNameSpan).toBeInTheDocument();

    const avatarImage = screen.getByTestId('mocked-image');
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('src', `https://directus.aglikace.cz/assets/${mockAvatar}`);
    expect(avatarImage).toHaveAttribute('alt', 'User');
  });

  it('opens the dropdown menu when the button is clicked', async () => {
    render(<DropdownProfile userName={mockUserName} avatar={mockAvatar} />);

    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    await waitFor(() => {
        const dropDownMenu = screen.getByRole('menu');
        expect(dropDownMenu).toBeInTheDocument();
    });
  });

  it('renders "Nastavení" link and redirect to /settings/account', async () => {
    render(<DropdownProfile userName={mockUserName} avatar={mockAvatar} />);

    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    await waitFor(() => {
      const settingsLink = screen.getByRole('link', { name: /Nastavení/i });
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute('href', '/settings/account');
    });
  });

  it('calls logout function when "Odhlásit se" is clicked', async () => {
    render(<DropdownProfile userName={mockUserName} avatar={mockAvatar} />);

    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    await waitFor(() => {
        const logoutButton = screen.getByText(/Odhlásit se/i)
        expect(logoutButton).toBeInTheDocument()
        fireEvent.click(logoutButton);
    });

    expect(logout).toHaveBeenCalled();
  });
  
  it('Dropdown menu have z-10 class', async () => {
    render(<DropdownProfile userName={mockUserName} avatar={mockAvatar} />);
    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    await waitFor(() => {
      const dropDownMenu = screen.getByRole('menu').parentElement;
      expect(dropDownMenu).toHaveClass("z-10");
    });
  });

});

