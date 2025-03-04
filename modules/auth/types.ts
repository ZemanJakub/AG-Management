// src/modules/auth/types.ts

// Role uživatele
export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
  }
  
  // Uživatel
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    lastLogin?: string;
  }
  
  // Přihlašovací formulář
  export interface LoginFormData {
    email: string;
    password: string;
  }
  
  // Výsledek přihlášení
  export interface LoginResult {
    success: boolean;
    error?: string;
    user?: User;
  }
  
  // Reset hesla
  export interface ResetPasswordData {
    email: string;
  }
  
  // Změna hesla
  export interface ChangePasswordData {
    token: string;
    password: string;
    passwordConfirm: string;
  }