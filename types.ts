export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export enum CustomerTier {
  NORMAL = 'NORMAL',
  CLUBE = 'CLUBE',
  VIP = 'VIP',
}

export enum LoanStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  DEFAULTED = 'DEFAULTED', // Inadimplente
}

export interface Installment {
  number: number;
  amount: number;
  dueDate: string; // ISO Date
  paid: boolean;
  paidAt?: string;
}

export interface Loan {
  id: string;
  userId: string;
  productName: string;
  totalAmount: number; // Value financed
  totalWithInterest: number; // Value to pay back
  interestRate: number; // Monthly rate
  installmentsCount: number;
  createdAt: string;
  status: LoanStatus;
  installments: Installment[];
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  photoUrl?: string;
  tier: CustomerTier;
  creditLimit: number;
  usedCredit: number; // Calculated dynamically in a real app, stored here for mock
  income: number;
  address: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}