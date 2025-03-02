import ThemeToggle from '@/components/default-components/theme-toggle'
import { render, screen, fireEvent } from '@testing-library/react'

import { useTheme } from 'next-themes'

// Mock useTheme z next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

describe('ThemeToggle', () => {
  it('vykreslí přepínač s aktuálním stavem světla/tmy', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
    })

    render(<ThemeToggle />)

    const toggle = screen.getByRole('checkbox', { name: /switch to light \/ dark version/i })
    
    expect(toggle).toBeInTheDocument()
    expect(toggle).not.toBeChecked() // Dark mode → není zaškrtnuté
  })

  it('přepíná na světlý režim, pokud je aktuálně tmavý', () => {
    const setThemeMock = jest.fn() as jest.Mock 
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: setThemeMock,
    })

    render(<ThemeToggle />)

    const toggle = screen.getByRole('checkbox', { name: /switch to light \/ dark version/i })

    fireEvent.click(toggle)

    expect(setThemeMock).toHaveBeenCalledTimes(1)
    expect(setThemeMock).toHaveBeenCalledWith('light')
  })

  it('přepíná na tmavý režim, pokud je aktuálně světlý', () => {
    const setThemeMock = jest.fn() as jest.Mock 
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    })

    render(<ThemeToggle />)

    const toggle = screen.getByRole('checkbox', { name: /switch to light \/ dark version/i })

    fireEvent.click(toggle)

    expect(setThemeMock).toHaveBeenCalledTimes(1)
    expect(setThemeMock).toHaveBeenCalledWith('dark')
  })
})
