import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSubscription } from '@/app/subscription-context'
import SubscriptionManagerModal from '@/app/lib/subscription-manager'

// Mock useSubscription
jest.mock('@/app/subscription-context', () => ({
  useSubscription: jest.fn(),
}))

describe('SubscriptionManagerModal', () => {
  const mockSubscribeToPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('není zobrazen, pokud už je uživatel přihlášen k odběru', () => {
    (useSubscription as jest.Mock).mockReturnValue({
      subscription: { endpoint: 'https://example.com' }, // Uživatel už je přihlášen
      subscribeToPush: mockSubscribeToPush,
      isSubscriptionLoading: false,
    })

    render(<SubscriptionManagerModal />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('zobrazuje modal, pokud uživatel není přihlášen k odběru', () => {
    (useSubscription as jest.Mock).mockReturnValue({
      subscription: null, // Uživatel není přihlášen
      subscribeToPush: mockSubscribeToPush,
      isSubscriptionLoading: false,
    })

    render(<SubscriptionManagerModal />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Notifikace')).toBeInTheDocument()
  })

  it('zavře modal po kliknutí na "Zavřít"', async () => {
    (useSubscription as jest.Mock).mockReturnValue({
      subscription: null,
      subscribeToPush: mockSubscribeToPush,
      isSubscriptionLoading: false,
    })

    render(<SubscriptionManagerModal />)

    const closeButton = screen.getByRole('button', { name: /Zavřít/i })
    await userEvent.click(closeButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('volá subscribeToPush při kliknutí na "Přihlásit se k odběru"', async () => {
    (useSubscription as jest.Mock).mockReturnValue({
      subscription: null,
      subscribeToPush: mockSubscribeToPush,
      isSubscriptionLoading: false,
    })

    render(<SubscriptionManagerModal />)

    const subscribeButton = screen.getByRole('button', { name: /Přihlásit se k odběru/i })
    await userEvent.click(subscribeButton)

    expect(mockSubscribeToPush).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument() // Modal by se měl zavřít
  })
})
