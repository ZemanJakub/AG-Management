// src/modules/auth/types.ts

/**
 * Typ pro odpověď z přihlašovací akce
 */
export type LoginResponse = {
  success?: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

/**
 * Typ pro přihlašovací data
 */
export type LoginData = {
  email: string;
  password: string;
};

/**
 * Typ pro přihlašovací akci
 */
export type LoginAction = (
  prevState: LoginResponse | undefined,
  formData: FormData
) => Promise<LoginResponse>;