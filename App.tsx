import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Users, DollarSign, LayoutDashboard, LogOut, 
  Menu, X, Check, AlertCircle, TrendingUp, Shield, Crown, 
  Search, Plus, Calendar, ChevronRight, User as UserIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { storeService } from './services/mockStore';
import { User, UserRole, CustomerTier, Loan, Installment, LoanStatus } from './types';

// --- COMPONENTS ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = 
  ({ className = '', variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-bb-blue hover:bg-bb-dark text-white shadow-md',
    secondary: 'bg-bb-yellow hover:bg-yellow-500 text-blue-900 font-bold shadow-sm',
    outline: 'border-2 border-bb-blue text-bb-blue hover:bg-blue-50',
    ghost: 'text-slate-600 hover:bg-slate-100'
  };
  return (
    <button 
      className={`px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {title && <div className="px-6 py-4 border-b border-slate-100 font-bold text-lg text-slate-800">{title}</div>}
    <div className="p-6">{children}</div>
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bb-blue focus:border-transparent outline-none transition-all ${className}`}
      {...props}
    />
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string }[] }> = 
  ({ label, options, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select 
      className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bb-blue focus:border-transparent outline-none transition-all bg-white ${className}`}
      {...props}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'blue' }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

const TierBadge: React.FC<{ tier: CustomerTier }> = ({ tier }) => {
  if (tier === CustomerTier.VIP) return <Badge color="purple">👑 Clube VIP</Badge>;
  if (tier === CustomerTier.CLUBE) return <Badge color="yellow">⭐ Clube BB</Badge>;
  return <Badge color="blue">Cliente Normal</Badge>;
};

// --- VIEWS ---

const LoginView: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [mode, setMode] = useState<'admin' | 'customer'>('customer');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storeService.login(identifier);
    if (user) {
      if (mode === 'admin' && user.role !== UserRole.ADMIN) {
        setError('Este usuário não é administrador.');
        return;
      }
      onLogin(user);
    } else {
      setError('Usuário não encontrado.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-bb-blue p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-bb-yellow p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-bb-blue" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Crédito BB Store</h1>
          <p className="text-blue-200 mt-2">Acesse sua conta para continuar</p>
        </div>
        
        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setMode('customer')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'customer' ? 'bg-white shadow text-bb-blue' : 'text-slate-500'}`}
            >
              Sou Cliente
            </button>
            <button 
              onClick={() => setMode('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'admin' ? 'bg-white shadow text-bb-blue' : 'text-slate-500'}`}
            >
              Sou Lojista
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <Input 
              label={mode === 'admin' ? "E-mail Corporativo" : "CPF"} 
              placeholder={mode === 'admin' ? "admin@bbstore.com" : "000.000.000-00"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Admin demo: admin@bbstore.com</p>
            <p>Cliente demo: 111.111.111-11</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CUSTOMER VIEWS ---

const CustomerHome: React.FC<{ user: User }> = ({ user }) => {
  const loans = useMemo(() => storeService.getLoans(user.id), [user.id]);
  const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE);
  const available = user.creditLimit - user.usedCredit;
  const progress = (user.usedCredit / user.creditLimit) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Digital Wallet Card */}
        <div className="bg-gradient-to-br from-bb-blue to-bb-dark rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <span className="text-blue-200 text-sm font-medium">Limite Disponível</span>
              <TierBadge tier={user.tier} />
            </div>
            <div className="text-4xl font-bold mb-2">
              R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-blue-200 mb-4">
              Limite Total: R$ {user.creditLimit.toLocaleString('pt-BR')}
            </div>
            
            <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2">
              <div className="bg-bb-yellow h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-blue-200">
              <span>Usado: {Math.round(progress)}%</span>
              <span>Disponível: {100 - Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col justify-center items-center">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-slate-500 text-sm">Próxima Fatura</span>
            <span className="font-bold text-lg text-slate-800">05/11</span>
          </Card>
          <Card className="flex flex-col justify-center items-center">
             <div className="bg-purple-100 p-3 rounded-full mb-3">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-slate-500 text-sm">Meus Pontos</span>
            <span className="font-bold text-lg text-slate-800">1.250</span>
          </Card>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-8">Minhas Compras</h3>
      {activeLoans.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhuma compra ativa no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeLoans.map(loan => (
            <Card key={loan.id} className="border-l-4 border-l-bb-blue">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-slate-800">{loan.productName}</h4>
                  <p className="text-sm text-slate-500">Comprado em {new Date(loan.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-bb-blue">R$ {loan.totalAmount.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-slate-400">{loan.installmentsCount}x parcelas</p>
                </div>
              </div>
              <div className="space-y-2">
                {loan.installments.slice(0, 3).map(inst => (
                  <div key={inst.number} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${inst.paid ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                      Parcela {inst.number}
                    </span>
                    <span className="text-slate-500">{new Date(inst.dueDate).toLocaleDateString('pt-BR')}</span>
                    <span className="font-medium">R$ {inst.amount.toFixed(2)}</span>
                    {inst.paid ? (
                      <Badge color="green">Pago</Badge>
                    ) : (
                      <Button variant="secondary" className="px-2 py-0.5 text-xs h-6" onClick={() => alert('Pagamento simulado com Sucesso via PIX!')}>
                        Pagar
                      </Button>
                    )}
                  </div>
                ))}
                {loan.installments.length > 3 && (
                   <p className="text-center text-xs text-slate-400 pt-2">... e mais {loan.installments.length - 3} parcelas</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const ClubView: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-bb-blue">Clube de Vantagens BB</h2>
        <p className="text-slate-600">Suba de nível e pague menos juros!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Normal */}
        <Card className={`relative ${user.tier === CustomerTier.NORMAL ? 'ring-2 ring-bb-blue' : 'opacity-70'}`}>
          <div className="text-center p-4">
            <h3 className="text-lg font-bold text-slate-700">Cliente Normal</h3>
            <div className="text-3xl font-bold text-bb-blue my-4">1.49% <span className="text-sm text-slate-500">a.m.</span></div>
            <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Acesso ao App</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Compras Parceladas</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-300"/> Atendimento Prioritário</li>
            </ul>
            {user.tier === CustomerTier.NORMAL && <Badge color="blue">Seu Nível Atual</Badge>}
          </div>
        </Card>

        {/* Clube */}
        <Card className={`relative bg-gradient-to-b from-white to-yellow-50 ${user.tier === CustomerTier.CLUBE ? 'ring-2 ring-bb-yellow' : ''}`}>
          <div className="absolute top-0 right-0 bg-bb-yellow text-bb-blue text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
          <div className="text-center p-4">
            <h3 className="text-lg font-bold text-yellow-600 flex items-center justify-center gap-2"><Crown className="w-5 h-5"/> Clube BB</h3>
            <div className="text-3xl font-bold text-bb-blue my-4">0.89% <span className="text-sm text-slate-500">a.m.</span></div>
            <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Juros Reduzidos</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Promoções Exclusivas</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Aumento de Limite</li>
            </ul>
            {user.tier === CustomerTier.CLUBE && <Badge color="yellow">Seu Nível Atual</Badge>}
          </div>
        </Card>

        {/* VIP */}
        <Card className={`relative bg-slate-900 text-white ${user.tier === CustomerTier.VIP ? 'ring-4 ring-purple-500' : ''}`}>
          <div className="text-center p-4">
            <h3 className="text-lg font-bold text-purple-300 flex items-center justify-center gap-2"><Shield className="w-5 h-5"/> Clube VIP</h3>
            <div className="text-3xl font-bold text-white my-4">0.89% <span className="text-sm text-slate-400">a.m.</span></div>
            <ul className="text-sm text-slate-300 space-y-2 text-left mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400"/> Menor Taxa do Mercado</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400"/> Limite Personalizado</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400"/> Gerente Dedicado</li>
            </ul>
             {user.tier === CustomerTier.VIP && <Badge color="purple">Seu Nível Atual</Badge>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- ADMIN VIEWS ---

const AdminDashboard: React.FC = () => {
  const metrics = storeService.getMetrics();
  const chartData = [
    { name: 'Seg', sales: 4000, profit: 240 },
    { name: 'Ter', sales: 3000, profit: 139 },
    { name: 'Qua', sales: 2000, profit: 980 },
    { name: 'Qui', sales: 2780, profit: 390 },
    { name: 'Sex', sales: 1890, profit: 480 },
    { name: 'Sáb', sales: 2390, profit: 380 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-bb-blue">
          <div className="text-sm text-slate-500">Total Emprestado</div>
          <div className="text-2xl font-bold text-bb-blue">R$ {metrics.totalLoaned.toLocaleString()}</div>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <div className="text-sm text-slate-500">Lucro Projetado</div>
          <div className="text-2xl font-bold text-green-600">R$ {metrics.projectedProfit.toLocaleString()}</div>
        </Card>
        <Card className="border-l-4 border-l-bb-yellow">
          <div className="text-sm text-slate-500">Clientes Ativos</div>
          <div className="text-2xl font-bold text-slate-800">{metrics.totalCustomers}</div>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <div className="text-sm text-slate-500">Em Atraso</div>
          <div className="text-2xl font-bold text-red-600">0</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Volume de Vendas (Semana)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="sales" fill="#003399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Lucro Estimado">
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="profit" stroke="#F4C610" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AdminCustomers: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  const [users, setUsers] = useState(storeService.getUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '', cpf: '', email: '', phone: '', income: '', address: ''
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.createUser({
      name: newUser.name,
      cpf: newUser.cpf,
      email: newUser.email,
      phone: newUser.phone,
      income: parseFloat(newUser.income),
      address: newUser.address,
      creditLimit: parseFloat(newUser.income) * 0.3, // 30% of income rule
      tier: CustomerTier.NORMAL,
      status: 'ACTIVE'
    });
    setUsers(storeService.getUsers());
    setIsModalOpen(false);
  };

  const handlePromote = (id: string, tier: CustomerTier) => {
    storeService.updateUserTier(id, tier);
    setUsers(storeService.getUsers());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CPF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Limite</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-full" src={u.photoUrl || `https://ui-avatars.com/api/?name=${u.name}&background=random`} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{u.name}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.cpf}</td>
                <td className="px-6 py-4 whitespace-nowrap"><TierBadge tier={u.tier} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  R$ {u.creditLimit.toLocaleString()} <span className="text-xs text-slate-400">({(u.creditLimit - u.usedCredit).toLocaleString()} Disp.)</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onNavigate('loan', { userId: u.id })} className="text-bb-blue hover:text-bb-dark mr-4">Nova Venda</button>
                  <button onClick={() => handlePromote(u.id, u.tier === CustomerTier.VIP ? CustomerTier.NORMAL : CustomerTier.VIP)} className="text-yellow-600 hover:text-yellow-800">
                    {u.tier === CustomerTier.VIP ? 'Rebaixar' : 'Promover VIP'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Cadastrar Novo Cliente</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input label="Nome Completo" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                 <Input label="CPF" value={newUser.cpf} onChange={e => setNewUser({...newUser, cpf: e.target.value})} required />
                 <Input label="Renda Mensal (R$)" type="number" value={newUser.income} onChange={e => setNewUser({...newUser, income: e.target.value})} required />
              </div>
              <Input label="E-mail" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              <Input label="Celular" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} required />
              <Input label="Endereço" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} required />
              <div className="flex gap-3 justify-end mt-6">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLoan: React.FC<{ initialUserId?: string, onCancel: () => void }> = ({ initialUserId, onCancel }) => {
  const users = storeService.getUsers();
  const [selectedUser, setSelectedUser] = useState(initialUserId || '');
  const [amount, setAmount] = useState('');
  const [product, setProduct] = useState('');
  const [months, setMonths] = useState('1');
  const [simulation, setSimulation] = useState<any>(null);

  const user = users.find(u => u.id === selectedUser);

  const handleSimulate = () => {
    if (!user || !amount) return;
    const calc = storeService.calculateInstallments(parseFloat(amount), parseInt(months), user.tier);
    setSimulation(calc);
  };

  const handleConfirm = () => {
    if (!user || !amount) return;
    storeService.createLoan(user.id, product, parseFloat(amount), parseInt(months));
    alert('Venda realizada com sucesso!');
    onCancel();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={onCancel} className="mb-4">← Voltar</Button>
      <Card title="Nova Venda Parcelada">
        <div className="space-y-6">
          <Select 
            label="Selecione o Cliente" 
            value={selectedUser} 
            onChange={(e) => { setSelectedUser(e.target.value); setSimulation(null); }}
            options={[
              { value: '', label: 'Selecione...' }, 
              ...users.map(u => ({ value: u.id, label: `${u.name} (Disp: R$ ${(u.creditLimit - u.usedCredit).toFixed(2)})` }))
            ]}
          />

          {user && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Categoria: <span className="text-bb-blue">{user.tier}</span></p>
                <p className="text-xs text-slate-500">Taxa de juros aplicada: {(storeService.getInterestRate(user.tier) * 100).toFixed(2)}% a.m.</p>
              </div>
              <TierBadge tier={user.tier} />
            </div>
          )}

          <Input label="Produto / Descrição" value={product} onChange={e => setProduct(e.target.value)} placeholder="Ex: TV 50 Polegadas" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor da Venda (R$)" type="number" value={amount} onChange={e => { setAmount(e.target.value); setSimulation(null); }} />
            <Select 
              label="Parcelas" 
              value={months} 
              onChange={e => { setMonths(e.target.value); setSimulation(null); }}
              options={[1, 2, 3, 4, 5, 6, 10, 12, 18, 24].map(n => ({ value: n.toString(), label: `${n}x` }))}
            />
          </div>

          <Button onClick={handleSimulate} variant="secondary" className="w-full" disabled={!selectedUser || !amount}>
            Simular Parcelamento
          </Button>

          {simulation && (
            <div className="mt-6 border-t pt-6 animate-in fade-in">
              <h4 className="font-bold text-lg mb-4">Resumo da Simulação</h4>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Valor Original:</span>
                  <span className="font-medium">R$ {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Juros ({simulation.ratePercentage}% a.m.):</span>
                  <span className="font-medium text-red-500">+ R$ {(simulation.total - parseFloat(amount)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total a Pagar:</span>
                  <span className="text-bb-blue">R$ {simulation.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-1">
                  <span>Parcelamento:</span>
                  <span>{months}x de R$ {simulation.monthlyPayment.toFixed(2)}</span>
                </div>
              </div>
              
              <Button onClick={handleConfirm} className="w-full mt-6 py-3 text-lg">
                Confirmar Venda
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// --- MAIN LAYOUT ---

const MainLayout: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [view, setView] = useState(user.role === UserRole.ADMIN ? 'dashboard' : 'wallet');
  const [params, setParams] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (page: string, p?: any) => {
    setView(page);
    if (p) setParams(p);
    setSidebarOpen(false); // close sidebar on mobile nav
  };

  const NavItem: React.FC<{ icon: any; label: string; target: string }> = ({ icon: Icon, label, target }) => (
    <button 
      onClick={() => navigate(target)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === target ? 'bg-bb-yellow text-bb-blue font-bold shadow-sm' : 'text-blue-100 hover:bg-blue-800'}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-bb-blue text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-blue-800 flex justify-between items-center">
          <div className="font-bold text-xl flex items-center gap-2">
            <div className="bg-bb-yellow p-1.5 rounded-lg text-bb-blue">
              <DollarSign className="w-5 h-5" />
            </div>
            BB Store
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6"/></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user.role === UserRole.ADMIN ? (
            <>
              <NavItem icon={LayoutDashboard} label="Painel Geral" target="dashboard" />
              <NavItem icon={Users} label="Clientes" target="customers" />
              <NavItem icon={CreditCard} label="Nova Venda" target="loan" />
              <NavItem icon={TrendingUp} label="Relatórios" target="reports" />
            </>
          ) : (
            <>
              <NavItem icon={CreditCard} label="Minha Carteira" target="wallet" />
              <NavItem icon={Crown} label="Clube BB" target="club" />
              <NavItem icon={UserIcon} label="Meus Dados" target="profile" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full bg-white" alt="User" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-blue-300 truncate">{user.role === 'ADMIN' ? 'Gerente' : user.tier}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-200 hover:bg-blue-900 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 lg:px-8">
          <button className="lg:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-700 capitalize">
            {view === 'dashboard' ? 'Visão Geral' : 
             view === 'customers' ? 'Gestão de Clientes' :
             view === 'loan' ? 'Realizar Venda' :
             view === 'wallet' ? 'Carteira Digital' :
             view === 'club' ? 'Benefícios do Clube' : view}
          </h1>
          <div className="flex items-center gap-2">
             {user.role === UserRole.CUSTOMER && <TierBadge tier={user.tier} />}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Render View Based on State */}
          {user.role === UserRole.ADMIN ? (
            <>
              {view === 'dashboard' && <AdminDashboard />}
              {view === 'customers' && <AdminCustomers onNavigate={navigate} />}
              {view === 'loan' && <AdminLoan initialUserId={params.userId} onCancel={() => navigate('customers')} />}
              {view === 'reports' && <div className="text-center py-20 text-slate-400">Relatórios Detalhados em desenvolvimento</div>}
            </>
          ) : (
            <>
              {view === 'wallet' && <CustomerHome user={user} />}
              {view === 'club' && <ClubView user={user} />}
              {view === 'profile' && (
                <Card title="Meus Dados">
                  <div className="space-y-4">
                    <Input label="Nome" value={user.name} disabled />
                    <Input label="CPF" value={user.cpf} disabled />
                    <Input label="E-mail" value={user.email} disabled />
                    <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800">
                      Para alterar seus dados, entre em contato com a loja.
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// --- APP ROOT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage or session for persistent login
    // In this mock, we just reset on reload for security demo, but store logic handles persistence
  }, []);

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} />;
  }

  return <MainLayout user={currentUser} onLogout={() => setCurrentUser(null)} />;
}