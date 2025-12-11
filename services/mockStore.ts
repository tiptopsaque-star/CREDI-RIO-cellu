import { User, UserRole, CustomerTier, Loan, LoanStatus, Installment } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    role: UserRole.ADMIN,
    name: 'Gerente Loja BB',
    email: 'admin@bbstore.com',
    cpf: '000.000.000-00',
    phone: '11999999999',
    tier: CustomerTier.VIP,
    creditLimit: 0,
    usedCredit: 0,
    income: 0,
    address: 'Loja Matriz',
    status: 'ACTIVE',
    photoUrl: 'https://picsum.photos/id/1/200/200'
  },
  {
    id: 'cust-1',
    role: UserRole.CUSTOMER,
    name: 'Ana Souza',
    email: 'ana@gmail.com',
    cpf: '111.111.111-11',
    phone: '11988888888',
    tier: CustomerTier.NORMAL,
    creditLimit: 1000,
    usedCredit: 0,
    income: 2500,
    address: 'Rua das Flores, 123',
    status: 'ACTIVE',
    photoUrl: 'https://picsum.photos/id/64/200/200'
  },
  {
    id: 'cust-2',
    role: UserRole.CUSTOMER,
    name: 'Carlos VIP',
    email: 'carlos@gmail.com',
    cpf: '222.222.222-22',
    phone: '11977777777',
    tier: CustomerTier.VIP,
    creditLimit: 5000,
    usedCredit: 1200,
    income: 8000,
    address: 'Av Paulista, 1000',
    status: 'ACTIVE',
    photoUrl: 'https://picsum.photos/id/91/200/200'
  }
];

const MOCK_LOANS: Loan[] = [
  {
    id: 'loan-1',
    userId: 'cust-2',
    productName: 'iPhone 13',
    totalAmount: 3000,
    totalWithInterest: 3200,
    interestRate: 0.89,
    installmentsCount: 10,
    createdAt: new Date().toISOString(),
    status: LoanStatus.ACTIVE,
    installments: Array.from({ length: 10 }).map((_, i) => ({
      number: i + 1,
      amount: 320,
      dueDate: new Date(new Date().setDate(new Date().getDate() + (i + 1) * 30)).toISOString(),
      paid: i < 3, // First 3 paid
      paidAt: i < 3 ? new Date().toISOString() : undefined
    }))
  }
];

// Service Class
class StoreService {
  private users: User[] = MOCK_USERS;
  private loans: Loan[] = MOCK_LOANS;

  constructor() {
    // Load from local storage if available to persist across reloads
    const storedUsers = localStorage.getItem('bb_users');
    const storedLoans = localStorage.getItem('bb_loans');
    if (storedUsers) this.users = JSON.parse(storedUsers);
    if (storedLoans) this.loans = JSON.parse(storedLoans);
  }

  private save() {
    localStorage.setItem('bb_users', JSON.stringify(this.users));
    localStorage.setItem('bb_loans', JSON.stringify(this.loans));
  }

  // --- Auth ---
  login(identifier: string): User | null {
    // Simple login: Email for admin, CPF for customer
    const user = this.users.find(u => u.email === identifier || u.cpf === identifier);
    return user || null;
  }

  // --- Users ---
  getUsers(): User[] {
    return this.users.filter(u => u.role === UserRole.CUSTOMER);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id' | 'role' | 'usedCredit'>): User {
    const newUser: User = {
      ...user,
      id: `cust-${Date.now()}`,
      role: UserRole.CUSTOMER,
      usedCredit: 0
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserTier(userId: string, tier: CustomerTier) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.tier = tier;
      this.save();
    }
  }

  updateUserLimit(userId: string, limit: number) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.creditLimit = limit;
      this.save();
    }
  }

  // --- Financial Logic ---
  getInterestRate(tier: CustomerTier): number {
    switch (tier) {
      case CustomerTier.VIP: return 0.0089; // 0.89%
      case CustomerTier.CLUBE: return 0.0089; // 0.89%
      default: return 0.0149; // 1.49%
    }
  }

  calculateInstallments(amount: number, months: number, tier: CustomerTier) {
    const rate = this.getInterestRate(tier);
    
    // PMT Formula: P * (r * (1+r)^n) / ((1+r)^n - 1)
    // However, store credit often uses simple compound addition: Total = P * (1 + r)^n
    // Let's use the standard Price Table (PMT) for fixed installments.
    
    const pmt = amount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const installmentValue = parseFloat(pmt.toFixed(2));
    const totalWithInterest = installmentValue * months;

    return {
      monthlyPayment: installmentValue,
      total: parseFloat(totalWithInterest.toFixed(2)),
      ratePercentage: (rate * 100).toFixed(2)
    };
  }

  createLoan(userId: string, product: string, amount: number, months: number): Loan {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    const calc = this.calculateInstallments(amount, months, user.tier);

    // Update used credit
    user.usedCredit += calc.total;
    
    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      userId: user.id,
      productName: product,
      totalAmount: amount,
      totalWithInterest: calc.total,
      interestRate: this.getInterestRate(user.tier),
      installmentsCount: months,
      createdAt: new Date().toISOString(),
      status: LoanStatus.ACTIVE,
      installments: Array.from({ length: months }).map((_, i) => ({
        number: i + 1,
        amount: calc.monthlyPayment,
        dueDate: new Date(new Date().setDate(new Date().getDate() + (i + 1) * 30)).toISOString(),
        paid: false
      }))
    };

    this.loans.push(newLoan);
    this.save();
    return newLoan;
  }

  getLoans(userId?: string): Loan[] {
    if (userId) return this.loans.filter(l => l.userId === userId);
    return this.loans;
  }

  payInstallment(loanId: string, installmentNumber: number) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) return;

    const inst = loan.installments.find(i => i.number === installmentNumber);
    if (inst && !inst.paid) {
      inst.paid = true;
      inst.paidAt = new Date().toISOString();
      
      // Reduce used credit for the user
      const user = this.users.find(u => u.id === loan.userId);
      if (user) {
        user.usedCredit = Math.max(0, user.usedCredit - inst.amount);
      }
      
      // Check if loan is fully paid
      if (loan.installments.every(i => i.paid)) {
        loan.status = LoanStatus.PAID;
      }
      
      this.save();
    }
  }

  getMetrics() {
    const activeLoans = this.loans.filter(l => l.status === LoanStatus.ACTIVE);
    const totalLoaned = this.loans.reduce((acc, l) => acc + l.totalAmount, 0);
    const expectedReturn = this.loans.reduce((acc, l) => acc + l.totalWithInterest, 0);
    const profit = expectedReturn - totalLoaned;
    
    return {
      totalCustomers: this.users.filter(u => u.role === UserRole.CUSTOMER).length,
      activeLoansCount: activeLoans.length,
      totalLoaned,
      projectedProfit: profit
    };
  }
}

export const storeService = new StoreService();