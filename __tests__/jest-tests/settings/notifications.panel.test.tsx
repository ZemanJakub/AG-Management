import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationsPanel from "@/app/(default)/settings/notifications/notifications-panel";
import { useSubscription } from "@/app/subscription-context";
import { sendNotification } from "@/actions";
import { toast } from "react-toastify";
import { SubscriptionContextProps } from "@/app/subscription-context";

jest.mock("@/app/subscription-context", () => ({
  useSubscription: jest.fn(),
}));

jest.mock("@/actions", () => ({
  sendNotification: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockUseSubscription = useSubscription as jest.MockedFunction<
  () => SubscriptionContextProps
>;

describe("NotificationsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSubscription.mockReturnValue({
      unsubscribeFromPush: jest.fn(),
      subscribeToPush: jest.fn(),
      subscription: null,
      isSubscriptionLoading: false,
      handleInstallClick: jest.fn(),
      isInstallable: false,
      isStandalone: false,
      isIOS: false,
    });
  });

  it("renders correctly", () => {
    render(<NotificationsPanel />);
    
    // Přesnější výběr prvku podle hierarchie
    expect(screen.getByText("Oznámení")).toBeInTheDocument();
    expect(screen.getByText("Test odesílání")).toBeInTheDocument();
    expect(screen.getByText("Vymazat notifikace")).toBeInTheDocument();

    // Výběr konkrétního nadpisu podle jeho role
    const section = screen.getByRole("heading", { name: "Push notifikace" });
    expect(section).toBeInTheDocument();
  });

  it("triggers sendNotification on button click", async () => {
    render(<NotificationsPanel />);
    const button = screen.getByRole("button", { name: /odeslat/i });

    await userEvent.click(button);

    expect(sendNotification).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith(
      "Nastavení",
      "Toto je testovací notifikace",
      "/settings/notifications"
    );
  });

  it("shows success toast when saving changes with push enabled", async () => {
    const mockSubscribe = jest.fn();
    mockUseSubscription.mockReturnValue({
      unsubscribeFromPush: jest.fn(),
      subscribeToPush: mockSubscribe,
      subscription: null,
      isSubscriptionLoading: false,
      handleInstallClick: jest.fn(),
      isInstallable: false,
      isStandalone: false,
      isIOS: false,
    });

    render(<NotificationsPanel />);
    
    // Simulace aktivace push notifikací kliknutím na switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);
    
    const saveButton = screen.getByRole("button", { name: /uložit změny/i });
    await userEvent.click(saveButton);

    // Ověření asynchronní akce pomocí waitFor
    await waitFor(() => expect(mockSubscribe).toHaveBeenCalledTimes(1));
    await waitFor(() => 
      expect(toast.success).toHaveBeenCalledWith(
        "Push notifikace byly úspěšně aktivovány.",
        expect.any(Object)
      )
    );
  });
});
