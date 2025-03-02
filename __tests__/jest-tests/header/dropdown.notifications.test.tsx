import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useSWR from 'swr'
import { NotificationData } from '@/app/lib/models'
import DropdownNotifications from '@/components/default-components/dropdown-notifications'

// Properly mock useSWR
jest.mock('swr')
const mockUseSWR = useSWR as jest.Mock

describe('DropdownNotifications', () => {
  const userId = 'user-123'

  it('zobrazuje "Loading notifications..." při načítání', () => {
    mockUseSWR.mockReturnValue({ data: null, error: null })

    render(<DropdownNotifications userId={userId} />)

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument()
  })

  it('zobrazuje chybovou hlášku, pokud dojde k chybě', () => {
    mockUseSWR.mockReturnValue({ data: null, error: new Error('Chyba načítání') })

    render(<DropdownNotifications userId={userId} />)

    expect(screen.getByText('Failed to load notifications.')).toBeInTheDocument()
  })

  it('zobrazuje "No new notifications", pokud nejsou žádné notifikace', async () => {
    mockUseSWR.mockReturnValue({ data: [], error: null })

    render(<DropdownNotifications userId={userId} />)

    // Otevřít dropdown
    await userEvent.click(screen.getByRole('button', { name: /Notifikace/i }))

    expect(screen.getByText('No new notifications')).toBeInTheDocument()
  })

  it('zobrazuje notifikace, pokud jsou dostupné', async () => {
    const mockNotifications: NotificationData[] = [
      { id: '1', message: 'Nová zpráva', url: '/messages', date_created: '2024-03-01', userId, title: 'Test', status: 'new' },
      { id: '2', message: 'Nový komentář', url: '/comments', date_created: '2024-03-02', userId, title: 'Test', status: 'new' },
    ]
    
    mockUseSWR.mockReturnValue({ data: mockNotifications, error: null })

    render(<DropdownNotifications userId={userId} />)

    // Otevřít dropdown
    await userEvent.click(screen.getByRole('button', { name: /Notifikace/i }))

    expect(screen.getByText('Nová zpráva')).toBeInTheDocument()
    expect(screen.getByText('Nový komentář')).toBeInTheDocument()
    expect(screen.getByText('1. března 2024')).toBeInTheDocument()
    expect(screen.getByText('2. března 2024')).toBeInTheDocument()
  })
})
