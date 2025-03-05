// __Tests__/jest-tests/setup.ts
import '@testing-library/jest-dom';

// Helper funkce pro vytvoření FormData v testech
function createTestFormData<T extends Record<string, any>>(data: T): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

// Přidání do global scope pro testy
global.createTestFormData = createTestFormData;

// Mocks pro Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => '/dashboard'), // Výchozí hodnota pro testy
  })),
  redirect: jest.fn(),
}));

// Mock pro cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock pro revalidaci cest
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// DŮLEŽITÉ: Mockování bude vytvořeno v jednotlivých testech, ne globálně
// To umožní správné nalezení modulů a zároveň flexibilitu v testech

// Mock pro useActionState a další React hooks
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useActionState: jest.fn((action, initialState) => {
      const actionFn = (formData:any) => action(initialState, formData);
      return [initialState, actionFn, false];
    }),
    startTransition: jest.fn((cb) => cb()),
    useFormStatus: jest.fn(() => ({ pending: false })),
  };
});

// Mock pro @directus/sdk
jest.mock('@directus/sdk', () => ({
  createDirectus: jest.fn(() => ({
    with: jest.fn(() => ({
      with: jest.fn(() => ({
        request: jest.fn(),
        login: jest.fn(),
        logout: jest.fn(),
      })),
    })),
  })),
  authentication: jest.fn(),
  rest: jest.fn(),
}));