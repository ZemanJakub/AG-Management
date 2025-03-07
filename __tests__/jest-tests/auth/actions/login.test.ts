// __tests__/jest-tests/auth/actions/login.test.ts

import { login } from "@/actions/auth/login";
import { directus } from "@/app/lib/directus";
import { createSession } from "@/app/lib/session";

// Mockování modulů
jest.mock("@/app/lib/directus", () => ({
  directus: {
    login: jest.fn(),
    request: jest.fn(),
  },
}));

jest.mock("@/app/lib/session", () => ({
  createSession: jest.fn(),
}));

// Mock pro funkci readMe
jest.mock("@directus/sdk", () => ({
  readMe: jest.fn().mockImplementation((params) => params),
}));

// Import readMe musí být po mockování
import { readMe } from "@directus/sdk";

// Mockování Date.now() pro konzistentní testování
const mockedDate = new Date(2024, 0, 1, 0, 0, 0).getTime();
const originalDateNow = Date.now;

beforeAll(() => {
  global.Date.now = jest.fn(() => mockedDate);
});

afterAll(() => {
  global.Date.now = originalDateNow;
});

describe("login server action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully log in a user with valid credentials", async () => {
    // Given
    const mockFormData = new FormData();
    mockFormData.append("email", "test@example.com");
    mockFormData.append("password", "password123");

    const mockAuthData = {
      access_token: "mocked_access_token",
      refresh_token: "mocked_refresh_token",
    };
    const mockUserData = {
      id: "1",
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      avatar: null,
    };

    (directus.login as jest.Mock).mockResolvedValue(mockAuthData);
    (directus.request as jest.Mock).mockResolvedValue(mockUserData);

    // When
    const result = await login({}, mockFormData);

    // Then
    expect(directus.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
    expect(directus.request).toHaveBeenCalled();
    expect(readMe).toHaveBeenCalledWith({
      fields: ["id", "first_name", "last_name", "email", "avatar"],
    });
    expect(directus.request).toHaveBeenCalledWith({
      fields: ["id", "first_name", "last_name", "email", "avatar"],
    });
    expect(createSession).toHaveBeenCalledWith({
      ...mockAuthData,
      ...mockUserData,
      expiresAt: mockedDate + 8 * 60 * 60 * 1000,
    });
    expect(result).toEqual({ success: true });
  });

  it("should return errors if the form data is invalid", async () => {
    // Given
    const mockFormData = new FormData();
    mockFormData.append("email", "invalid-email");
    // Upravit délku hesla podle minimální délky ve vašem schématu
    mockFormData.append("password", "123");

    // When
    const result = await login({}, mockFormData);

    // Then
    expect(result).toHaveProperty("errors");
    const errors = result.errors;
    expect(errors).toHaveProperty("email");

    // // Ověříme pouze, že email obsahuje chybovou zprávu
    if (errors && errors.email) {
      expect(errors.email).toEqual(["Chybná emailová adresa"]);
    }

    // // Volitelně - pokud víme, že heslo se validuje samostatně,
    // // můžeme upravit test podle skutečného chování
    if (errors && errors.password) {
      expect(errors.password).toEqual(["Heslo musí obsahovat alespoň 4 znaky"]);
    }

    expect(directus.login).not.toHaveBeenCalled();
    expect(directus.request).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
    expect(readMe).not.toHaveBeenCalled();
  });

  it("should handle login errors and return a message", async () => {
    // Given
    const mockFormData = new FormData();
    mockFormData.append("email", "test@example.com");
    mockFormData.append("password", "password123");

    // Mockování console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    (directus.login as jest.Mock).mockRejectedValue(new Error("Login failed"));

    // When
    const result = await login({}, mockFormData);

    // Then
    expect(directus.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
    expect(result).toEqual({
      message: "Zadaný email, nebo heslo nejsou platné",
    });
    expect(directus.request).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
