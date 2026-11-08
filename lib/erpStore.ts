import {
  Market,
  Employee,
  Customer,
  Supplier,
  Product,
  ProductBatch,
  Purchase,
  EmpStock,
  StockTransfer,
  Invoice,
  SalesReturn,
  DamagedExpiredStock,
  LedgerEntry,
  Expense,
  Attendance,
  EmployeeTarget,
  Payroll,
  UserRole,
  Doctor,
  DoctorExpense,
} from '@/types/erp';
import { isSupabaseConfigured, fetchFromCloud, syncRecordToCloud, deleteRecordFromCloud, generateUUID, supabase } from '@/lib/supabase';
import { broadcastLiveAlert } from '@/lib/realtimeAlerts';

// CLEAN INITIAL PRODUCTION DATA (ZERO DEMO RECORDS)
const initialMarkets: Market[] = [];

const initialEmployees: Employee[] = [
  {
    emp_id: 'ADM-01',
    name: 'Samin Yeasar',
    phone: '+8801770578142',
    designation: 'Chief Executive Officer & Super Admin',
    role: 'super_admin',
    joining_date: '2023-01-01',
    primary_market_id: null,
    base_salary: 80000,
    daily_ta_da: 500,
    commission_percent: 2.0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'EXE-01',
    name: 'Dr. Rafiqul Islam',
    phone: '+8801711000002',
    designation: 'Managing Director',
    role: 'executor',
    joining_date: '2023-01-01',
    primary_market_id: null,
    base_salary: 120000,
    daily_ta_da: 600,
    commission_percent: 3.0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'MGR-01',
    name: 'Farhan Ahmed',
    phone: '+8801711000005',
    designation: 'Chief Operations Manager',
    role: 'manager',
    joining_date: '2023-03-15',
    primary_market_id: null,
    base_salary: 60000,
    daily_ta_da: 400,
    commission_percent: 1.5,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'ACC-01',
    name: 'Nazmul Huda',
    phone: '+8801711000004',
    designation: 'Chief Financial Accountant',
    role: 'accountant',
    joining_date: '2023-04-01',
    primary_market_id: null,
    base_salary: 45000,
    daily_ta_da: 300,
    commission_percent: 0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
  {
    emp_id: 'STR-01',
    name: 'Belal Hossain',
    phone: '+8801711000003',
    designation: 'Central Godown & Store In-charge',
    role: 'store_keeper',
    joining_date: '2023-05-10',
    primary_market_id: null,
    base_salary: 32000,
    daily_ta_da: 250,
    commission_percent: 0,
    current_due_balance: 0,
    salary_advance_balance: 0,
    is_active: true,
  },
];

const initialCustomers: Customer[] = [];

const initialSuppliers: Supplier[] = [];

const initialDoctors: Doctor[] = [];

const initialDoctorExpenses: DoctorExpense[] = [];

const initialProducts: Product[] = [];

const initialBatches: ProductBatch[] = [];

const initialEmpStock: EmpStock[] = [];

const initialInvoices: Invoice[] = [];

const initialLedger: LedgerEntry[] = [];

const initialExpenses: Expense[] = [];

const initialAttendance: Attendance[] = [];

const initialTargets: EmployeeTarget[] = [];

const initialPayroll: Payroll[] = [];

// IN-BROWSER PERSISTENT STORE CLASS
class ERPStore {
  private markets: Market[] = initialMarkets;
  private employees: Employee[] = initialEmployees;
  private customers: Customer[] = initialCustomers;
  private suppliers: Supplier[] = initialSuppliers;
  private products: Product[] = initialProducts;
  private batches: ProductBatch[] = initialBatches;
  private empStock: EmpStock[] = initialEmpStock;
  private stockTransfers: StockTransfer[] = [];
  private invoices: Invoice[] = initialInvoices;
  private purchases: Purchase[] = [];
  private returns: SalesReturn[] = [];
  private damagedStock: DamagedExpiredStock[] = [];
  private ledger: LedgerEntry[] = initialLedger;
  private expenses: Expense[] = initialExpenses;
  private attendance: Attendance[] = initialAttendance;
  private targets: EmployeeTarget[] = initialTargets;
  private payroll: Payroll[] = initialPayroll;
  private doctors: Doctor[] = initialDoctors;
  private doctorExpenses: DoctorExpense[] = initialDoctorExpenses;
  private activePortal: 'hq' | 'field' = 'hq';
  private monthlySalesTarget: number = 0;

  private currentUser: Employee = initialEmployees[0]; // Default Super Admin for instant preview
  private listeners: Set<() => void> = new Set();
  private initialized = false;
  private isSyncingWithCloud = false;
  private lastCloudSyncTime: Date | null = null;
  private cloudSyncError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      if (isSupabaseConfigured()) {
        setTimeout(() => {
          this.syncWithCloud();
        }, 1200);
      }
    }
  }

  public async syncWithCloud(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured yet. Operating in local storage mode.' };
    }
    this.isSyncingWithCloud = true;
    try {
      const [
        cloudProducts,
        cloudEmployees,
        cloudBatches,
        cloudEmpStock,
        cloudInvoices,
        cloudExpenses,
        cloudDoctors,
        cloudDoctorExpenses,
        cloudAttendance,
        cloudPayroll,
        cloudLedger,
        cloudSuppliers,
        cloudCustomers,
      ] = await Promise.all([
        fetchFromCloud<Product>('products'),
        fetchFromCloud<Employee>('employees'),
        fetchFromCloud<ProductBatch>('product_batches'),
        fetchFromCloud<EmpStock>('emp_stock'),
        fetchFromCloud<Invoice>('invoices'),
        fetchFromCloud<Expense>('expenses'),
        fetchFromCloud<Doctor>('doctors'),
        fetchFromCloud<DoctorExpense>('doctor_expenses'),
        fetchFromCloud<Attendance>('attendance'),
        fetchFromCloud<Payroll>('payroll'),
        fetchFromCloud<LedgerEntry>('ledger'),
        fetchFromCloud<Supplier>('suppliers'),
        fetchFromCloud<Customer>('customers'),
      ]);

      let updatedAny = false;

      if (cloudProducts !== null) {
        this.products = cloudProducts;
        updatedAny = true;
      }
      if (cloudEmployees && cloudEmployees.length > 0) {
        this.employees = cloudEmployees;
        updatedAny = true;
      }
      if (cloudBatches !== null) {
        this.batches = cloudBatches;
        updatedAny = true;
      }
      if (cloudEmpStock !== null) {
        this.empStock = cloudEmpStock;
        updatedAny = true;
      }
      if (cloudInvoices !== null) {
        this.invoices = cloudInvoices;
        updatedAny = true;
      }
      if (cloudExpenses !== null) {
        this.expenses = cloudExpenses;
        updatedAny = true;
      }
      if (cloudDoctors !== null) {
        this.doctors = cloudDoctors;
        updatedAny = true;
      }
      if (cloudDoctorExpenses !== null) {
        this.doctorExpenses = cloudDoctorExpenses;
        updatedAny = true;
      }
      if (cloudAttendance !== null) {
        this.attendance = cloudAttendance;
        updatedAny = true;
      }
      if (cloudPayroll !== null) {
        this.payroll = cloudPayroll;
        updatedAny = true;
      }
      if (cloudLedger !== null) {
        this.ledger = cloudLedger;
        updatedAny = true;
      }
      if (cloudSuppliers !== null) {
        this.suppliers = cloudSuppliers;
        updatedAny = true;
      }
      if (cloudCustomers !== null) {
        this.customers = cloudCustomers;
        updatedAny = true;
      }

      this.lastCloudSyncTime = new Date();
      this.cloudSyncError = null;

      if (updatedAny) {
        this.saveToStorage();
        this.notify();
      }

      return { success: true, message: 'Cloud database synchronized successfully.' };
    } catch (err: any) {
      this.cloudSyncError = err?.message || 'Cloud sync failed';
      return { success: false, message: this.cloudSyncError || 'Sync error' };
    } finally {
      this.isSyncingWithCloud = false;
      this.notify();
    }
  }

  public getCloudStatus() {
    return {
      isConfigured: isSupabaseConfigured(),
      isSyncing: this.isSyncingWithCloud,
      lastSynced: this.lastCloudSyncTime,
      error: this.cloudSyncError,
    };
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('senatix_erp_markets', JSON.stringify(this.markets));
      localStorage.setItem('senatix_erp_employees', JSON.stringify(this.employees));
      localStorage.setItem('senatix_erp_customers', JSON.stringify(this.customers));
      localStorage.setItem('senatix_erp_suppliers', JSON.stringify(this.suppliers));
      localStorage.setItem('senatix_erp_products', JSON.stringify(this.products));
      localStorage.setItem('senatix_erp_batches', JSON.stringify(this.batches));
      localStorage.setItem('senatix_erp_emp_stock', JSON.stringify(this.empStock));
      localStorage.setItem('senatix_erp_invoices', JSON.stringify(this.invoices));
      localStorage.setItem('senatix_erp_ledger', JSON.stringify(this.ledger));
      localStorage.setItem('senatix_erp_expenses', JSON.stringify(this.expenses));
      localStorage.setItem('senatix_erp_attendance', JSON.stringify(this.attendance));
      localStorage.setItem('senatix_erp_payroll', JSON.stringify(this.payroll));
      localStorage.setItem('senatix_erp_doctors', JSON.stringify(this.doctors));
      localStorage.setItem('senatix_erp_doctor_expenses', JSON.stringify(this.doctorExpenses));
      localStorage.setItem('senatix_erp_portal', this.activePortal);
      localStorage.setItem('senatix_erp_user', JSON.stringify(this.currentUser));
      localStorage.setItem('senatix_monthly_sales_target', this.monthlySalesTarget.toString());
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.notify();
  }

  private loadFromStorage() {
    if (this.initialized) return;
    try {
      const CURRENT_STORAGE_VER = '2026_v5_pure_production';
      if (typeof window !== 'undefined' && localStorage.getItem('senatix_storage_ver') !== CURRENT_STORAGE_VER) {
        localStorage.removeItem('senatix_erp_products');
        localStorage.removeItem('senatix_erp_batches');
        localStorage.removeItem('senatix_erp_doctors');
        localStorage.removeItem('senatix_erp_doctor_expenses');
        localStorage.removeItem('senatix_erp_markets');
        localStorage.removeItem('senatix_erp_customers');
        localStorage.removeItem('senatix_erp_attendance');
        localStorage.removeItem('senatix_erp_payroll');
        localStorage.removeItem('senatix_erp_targets');
        localStorage.removeItem('senatix_erp_expenses');
        localStorage.removeItem('senatix_erp_emp_stock');
        localStorage.removeItem('senatix_erp_invoices');
        localStorage.removeItem('senatix_erp_ledger');
        localStorage.removeItem('senatix_erp_suppliers');
        localStorage.removeItem('senatix_erp_employees');
        localStorage.setItem('senatix_storage_ver', CURRENT_STORAGE_VER);
      }

      const get = (key: string) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      };

      this.markets = get('senatix_erp_markets') || initialMarkets;
      this.employees = get('senatix_erp_employees') || initialEmployees;
      this.customers = get('senatix_erp_customers') || initialCustomers;
      this.suppliers = get('senatix_erp_suppliers') || initialSuppliers;
      this.products = get('senatix_erp_products') || initialProducts;
      this.batches = get('senatix_erp_batches') || initialBatches;
      this.empStock = get('senatix_erp_emp_stock') || initialEmpStock;
      this.invoices = get('senatix_erp_invoices') || initialInvoices;
      this.ledger = get('senatix_erp_ledger') || initialLedger;
      this.expenses = get('senatix_erp_expenses') || initialExpenses;
      this.attendance = get('senatix_erp_attendance') || initialAttendance;
      this.payroll = get('senatix_erp_payroll') || initialPayroll;
      this.doctors = get('senatix_erp_doctors') || initialDoctors;
      this.doctorExpenses = get('senatix_erp_doctor_expenses') || initialDoctorExpenses;
      this.activePortal = (localStorage.getItem('senatix_erp_portal') as 'hq' | 'field') || 'hq';
      this.currentUser = get('senatix_erp_user') || initialEmployees[0];
      const savedTarget = localStorage.getItem('senatix_monthly_sales_target');
      this.monthlySalesTarget = savedTarget ? parseFloat(savedTarget) || 0 : 0;
      this.initialized = true;
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // AUTH & USER
  public getCurrentUser(): Employee {
    return this.currentUser;
  }

  public setCurrentUser(emp: Employee) {
    this.currentUser = emp;
    this.saveToStorage();
  }

  public getActivePortal(): 'hq' | 'field' {
    return this.activePortal;
  }

  public setActivePortal(portal: 'hq' | 'field') {
    this.activePortal = portal;
    this.saveToStorage();
  }

  public async loginWithCredentials(
    identifier: string,
    secret: string
  ): Promise<{ success: boolean; user?: Employee; message?: string }> {
    const cleanId = identifier.trim().toLowerCase().replace('@senatix.local', '');
    const cleanSecret = secret.trim();

    if (!cleanId || !cleanSecret) {
      return {
        success: false,
        message: 'অনুগ্রহ করে আইডি এবং পাসওয়ার্ড উভয় তথ্যই প্রদান করুন।',
      };
    }

    // Master/standard passwords accepted across the system
    const validMasterPasswords = [
      'senatixadmin2026!',
      'director2026@',
      'manager2026@',
      'accounts2026@',
      'godownstore2026@',
      'senatix1234@',
      'saminsami1234',
      'senatix2026@',
    ];

    // STEP 1: Attempt Authentication via Supabase Auth (for customized email/password users created in Supabase Dashboard)
    if (isSupabaseConfigured() && cleanId.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanSecret,
        });

        if (!authError && authData?.user) {
          const userEmail = (authData.user.email || cleanId).toLowerCase();

          // Refresh employees from database to get latest records
          try {
            const { data: cloudEmp } = await supabase.from('employees').select('*');
            if (cloudEmp && cloudEmp.length > 0) {
              this.employees = cloudEmp;
            }
          } catch (e) {}

          let matched = this.employees.find(
            (e) =>
              e.emp_id.toLowerCase() === userEmail ||
              e.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
          );

          if (!matched) {
            // First time customized Supabase Auth user: automatically create active administrator profile
            matched = {
              emp_id: `ADM-${authData.user.id.substring(0, 6).toUpperCase()}`,
              name: authData.user.user_metadata?.name || userEmail.split('@')[0] || 'Administrator',
              phone: authData.user.phone || '01711000000',
              designation: 'System Administrator',
              role: 'super_admin',
              is_active: true,
              base_salary: 0,
              daily_ta_da: 0,
              commission_percent: 0,
              current_due_balance: 0,
              salary_advance_balance: 0,
            };
            this.employees.unshift(matched);
            syncRecordToCloud('employees', matched);
          }

          this.currentUser = matched;
          this.activePortal = 'hq';
          this.saveToStorage();
          return { success: true, user: matched };
        }
      } catch (err) {
        // Fall through to database / employee lookup
      }
    }

    // STEP 2: Fetch latest employees from Supabase database (in case new staff were added)
    if (isSupabaseConfigured()) {
      try {
        const { data: cloudEmp } = await supabase.from('employees').select('*');
        if (cloudEmp && cloudEmp.length > 0) {
          this.employees = cloudEmp;
        }
      } catch (err) {}
    }

    // STEP 3: Match Employee by ID, Email or Phone
    const isSuperAdminIdentifier =
      cleanId === 'adm-01' ||
      cleanId === 'senatixwellness@gmail.com' ||
      cleanId === 'saminsami73@gmail.com' ||
      cleanId === '01770578142' ||
      cleanId === '+8801770578142' ||
      cleanId === '8801770578142' ||
      cleanId === '01711000001' ||
      cleanId === 'samin' ||
      cleanId === 'admin';

    const isManagingDirector =
      cleanId === 'exe-01' ||
      cleanId === '01711000002' ||
      cleanId === '+8801711000002' ||
      cleanId === 'director';

    const isOperationsManager =
      cleanId === 'mgr-01' ||
      cleanId === '01711000005' ||
      cleanId === '+8801711000005' ||
      cleanId === 'manager';

    const isAccountant =
      cleanId === 'acc-01' ||
      cleanId === '01711000004' ||
      cleanId === '+8801711000004' ||
      cleanId === 'accounts' ||
      cleanId === 'accountant';

    const isStoreKeeper =
      cleanId === 'str-01' ||
      cleanId === '01711000003' ||
      cleanId === '+8801711000003' ||
      cleanId === 'store' ||
      cleanId === 'storekeeper';

    let found: Employee | undefined;
    if (isSuperAdminIdentifier) {
      found = this.employees.find((e) => e.role === 'super_admin') || this.employees[0];
    } else if (isManagingDirector) {
      found = this.employees.find((e) => e.role === 'executor') || this.employees[1];
    } else if (isOperationsManager) {
      found = this.employees.find((e) => e.role === 'manager');
    } else if (isAccountant) {
      found = this.employees.find((e) => e.role === 'accountant');
    } else if (isStoreKeeper) {
      found = this.employees.find((e) => e.role === 'store_keeper');
    } else {
      found = this.employees.find(
        (e) =>
          e.emp_id.toLowerCase() === cleanId ||
          e.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
      );
    }

    if (!found) {
      return {
        success: false,
        message: 'প্রদত্ত আইডি বা ইমেইল পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।',
      };
    }

    // STEP 4: Password Verification
    const isMasterPassword = validMasterPasswords.includes(cleanSecret.toLowerCase());
    if (!isMasterPassword) {
      // If the password doesn't match master passwords, check Supabase Auth for this user's email if available
      let authVerified = false;
      if (isSupabaseConfigured()) {
        try {
          const tryEmail = cleanId.includes('@') ? cleanId : `${cleanId}@senatix.local`;
          const { data } = await supabase.auth.signInWithPassword({
            email: tryEmail,
            password: cleanSecret,
          });
          if (data?.user) {
            authVerified = true;
          }
        } catch (e) {}
      }

      if (!authVerified) {
        return {
          success: false,
          message: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।',
        };
      }
    }

    // STEP 5: Strict Role Control (Admins, Executives, Managers, Accountants, Store Keepers)
    const allowedRoles = ['super_admin', 'executor', 'manager', 'accountant', 'store_keeper'];
    if (!allowedRoles.includes(found.role)) {
      return {
        success: false,
        message: 'অননুমোদিত প্রবেশাধিকার: এই সিস্টেমটি শুধুমাত্র ব্যবস্থাপনা কর্তৃপক্ষ ও এডমিনদের জন্য সংরক্ষিত।',
      };
    }

    this.currentUser = found;
    this.activePortal = 'hq';
    this.saveToStorage();
    return { success: true, user: found };
  }

  // MARKETS
  public getMarkets(): Market[] {
    return this.markets;
  }

  public addMarket(m: Omit<Market, 'id'>) {
    const newMarket: Market = {
      ...m,
      id: `mkt-${Date.now()}`,
    };
    this.markets.push(newMarket);
    this.saveToStorage();
    return newMarket;
  }

  // EMPLOYEES
  public getEmployees(): Employee[] {
    return this.employees.map((e) => {
      const mkt = this.markets.find((m) => m.id === e.primary_market_id);
      return { ...e, market_name: mkt?.name };
    });
  }

  public addEmployee(emp: Employee) {
    this.employees.push(emp);
    this.saveToStorage();
    syncRecordToCloud('employees', emp);
    return emp;
  }

  public updateEmployee(emp_id: string, updates: Partial<Employee>) {
    this.employees = this.employees.map((e) => (e.emp_id === emp_id ? { ...e, ...updates } : e));
    if (this.currentUser.emp_id === emp_id) {
      this.currentUser = { ...this.currentUser, ...updates };
    }
    this.saveToStorage();
    const updated = this.employees.find((e) => e.emp_id === emp_id);
    if (updated) {
      syncRecordToCloud('employees', updated);
    }
  }

  public collectEmployeeCashDue(params: {
    emp_id: string;
    amount: number;
    payment_method: 'Cash' | 'bKash' | 'Bank';
    notes?: string;
  }): { success: boolean; balanceRemaining: number; voucherRef: string } {
    const emp = this.employees.find((e) => e.emp_id === params.emp_id);
    if (!emp) {
      throw new Error('Employee not found');
    }
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    emp.current_due_balance = Math.max(0, emp.current_due_balance - params.amount);

    const voucherRef = `VCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newLedger: LedgerEntry = {
      id: generateUUID(),
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      account_type: 'Employee',
      emp_id: emp.emp_id,
      invoice_ref: voucherRef,
      payment_method: params.payment_method,
      description: `ফিল্ড বিক্রয় ক্যাশ জমা: ${emp.name} (${params.notes || 'ক্যাশ ভাউচার'})`,
      debit: 0,
      credit: params.amount,
      balance: emp.current_due_balance,
      party_name: emp.name,
    };

    this.ledger.unshift(newLedger);
    this.saveToStorage();

    syncRecordToCloud('employees', emp);
    syncRecordToCloud('ledger', newLedger);

    broadcastLiveAlert({
      type: 'cash',
      title: `ফিল্ড ক্যাশ জমা: ${voucherRef}`,
      title_bn: `ফিল্ড ক্যাশ জমা: ${voucherRef}`,
      description: `${emp.name} ৳${params.amount.toLocaleString()} জমা দিয়েছেন (${params.payment_method})। অবশিষ্ট বকেয়া: ৳${emp.current_due_balance.toLocaleString()}`,
      description_bn: `${emp.name} ৳${params.amount.toLocaleString()} জমা দিয়েছেন (${params.payment_method})। অবশিষ্ট বকেয়া: ৳${emp.current_due_balance.toLocaleString()}`,
    });

    return {
      success: true,
      balanceRemaining: emp.current_due_balance,
      voucherRef,
    };
  }

  // CUSTOMERS
  public getCustomers(): Customer[] {
    return this.customers.map((c) => {
      const mkt = this.markets.find((m) => m.id === c.market_id);
      const emp = this.employees.find((e) => e.emp_id === c.assigned_emp_id);
      return {
        ...c,
        market_name: mkt?.name,
        assigned_emp_name: emp?.name,
      };
    });
  }

  public addCustomer(cust: Omit<Customer, 'id' | 'current_due_balance'>) {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      current_due_balance: 0,
    };
    this.customers.push(newCust);
    this.saveToStorage();
    return newCust;
  }

  public collectCustomerDue(customerId: string, amount: number, method: string, note?: string) {
    const cust = this.customers.find((c) => c.id === customerId);
    if (!cust) return;

    cust.current_due_balance = Math.max(0, cust.current_due_balance - amount);

    // Add to ledger
    const newLedger: LedgerEntry = {
      id: generateUUID(),
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      account_type: 'Customer',
      customer_id: cust.id,
      emp_id: this.currentUser.emp_id,
      payment_method: method,
      description: `Baki Collection: ${cust.shop_name} (${note || 'Field Receipt'})`,
      debit: 0,
      credit: amount,
      balance: cust.current_due_balance,
      party_name: cust.shop_name,
    };
    this.ledger.unshift(newLedger);
    this.saveToStorage();
    syncRecordToCloud('ledger', newLedger);
  }

  // SUPPLIERS
  public getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  public addSupplier(s: Omit<Supplier, 'id' | 'payable_balance'>) {
    const newSup: Supplier = {
      ...s,
      id: `sup-${Date.now()}`,
      payable_balance: 0,
    };
    this.suppliers.push(newSup);
    this.saveToStorage();
    return newSup;
  }

  // DOCTORS & PRESCRIBERS
  public getDoctors(marketId?: string, empId?: string): Doctor[] {
    let list = this.doctors.map((d) => {
      const mkt = this.markets.find((m) => m.id === d.market_id);
      const emp = this.employees.find((e) => e.emp_id === d.assigned_emp_id);
      return {
        ...d,
        market_name: mkt?.name,
        assigned_emp_name: emp?.name,
      };
    });

    if (marketId && marketId !== 'all') {
      list = list.filter((d) => d.market_id === marketId);
    }
    if (empId && empId !== 'all') {
      list = list.filter((d) => d.assigned_emp_id === empId);
    }
    return list;
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id);
  }

  public addDoctor(doc: Omit<Doctor, 'id' | 'created_at'>): Doctor {
    const newDoc: Doctor = {
      ...doc,
      id: generateUUID(),
      doctor_code: doc.doctor_code || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptions_written_monthly: doc.prescriptions_written_monthly || 0,
      total_promotional_expense: doc.total_promotional_expense || 0,
      is_active: doc.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    this.doctors.unshift(newDoc);
    this.saveToStorage();
    syncRecordToCloud('doctors', newDoc);

    broadcastLiveAlert({
      type: 'doctor',
      title: `নতুন ডাক্তার তালিকাভুক্ত: ${newDoc.name}`,
      title_bn: `নতুন ডাক্তার তালিকাভুক্ত: ${newDoc.name}`,
      description: `${newDoc.name} (${newDoc.specialty}) সিস্টেমে যুক্ত হয়েছেন। চেম্বার: ${newDoc.hospital_chamber}`,
      description_bn: `${newDoc.name} (${newDoc.specialty}) সিস্টেমে যুক্ত হয়েছেন। চেম্বার: ${newDoc.hospital_chamber}`,
    });

    return newDoc;
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const idx = this.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.doctors[idx] = { ...this.doctors[idx], ...updates };
    this.saveToStorage();
    syncRecordToCloud('doctors', this.doctors[idx]);
    return this.doctors[idx];
  }

  public deleteDoctor(id: string): boolean {
    const initialLen = this.doctors.length;
    this.doctors = this.doctors.filter((d) => d.id !== id);
    if (this.doctors.length !== initialLen) {
      this.saveToStorage();
      deleteRecordFromCloud('doctors', 'id', id);
      return true;
    }
    return false;
  }

  // DOCTOR PROMOTIONAL EXPENSES & PRESCRIPTIONS
  public getDoctorExpenses(doctorId?: string, empId?: string): DoctorExpense[] {
    let list = this.doctorExpenses.map((exp) => {
      const doc = this.doctors.find((d) => d.id === exp.doctor_id);
      const emp = this.employees.find((e) => e.emp_id === exp.emp_id);
      return {
        ...exp,
        doctor_name: doc?.name || 'Unknown Doctor',
        employee_name: emp?.name || 'Field Officer',
      };
    });

    if (doctorId && doctorId !== 'all') {
      list = list.filter((e) => e.doctor_id === doctorId);
    }
    if (empId && empId !== 'all') {
      list = list.filter((e) => e.emp_id === empId);
    }
    return list.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  }

  public addDoctorExpense(exp: Omit<DoctorExpense, 'id' | 'created_at'>): DoctorExpense {
    const newExpense: DoctorExpense = {
      ...exp,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.doctorExpenses.unshift(newExpense);

    // Update doctor's cumulative totals automatically:
    const doc = this.doctors.find((d) => d.id === exp.doctor_id);
    if (doc) {
      doc.total_promotional_expense = (doc.total_promotional_expense || 0) + Number(exp.amount || 0);
      if (exp.prescriptions_written_count && exp.prescriptions_written_count > 0) {
        doc.prescriptions_written_monthly = (doc.prescriptions_written_monthly || 0) + Number(exp.prescriptions_written_count);
      }
      syncRecordToCloud('doctors', doc);
    }

    // Auto-record under company operational expenses if financial cost occurred
    if (exp.amount > 0) {
      const promoExp: Expense = {
        id: generateUUID(),
        expense_date: exp.expense_date,
        category: 'Doctor_Gift',
        title: `Doctor Promo: ${doc?.name || 'Doctor'} - ${exp.title}`,
        amount: exp.amount,
        payment_method: 'Cash',
        entered_by_emp_id: exp.emp_id,
        entered_by_name: this.currentUser.name,
      };
      this.expenses.unshift(promoExp);
      syncRecordToCloud('expenses', promoExp);
    }

    this.saveToStorage();
    syncRecordToCloud('doctor_expenses', newExpense);

    broadcastLiveAlert({
      type: 'expense',
      title: 'ডাক্তার প্রমোশনাল ব্যয় লিপিবদ্ধ',
      title_bn: 'ডাক্তার প্রমোশনাল ব্যয় লিপিবদ্ধ',
      description: `${doc?.name || 'ডাক্তার'}-এর জন্য ৳${newExpense.amount.toLocaleString()} ব্যয় রেকর্ড হয়েছে (${newExpense.title})।`,
      description_bn: `${doc?.name || 'ডাক্তার'}-এর জন্য ৳${newExpense.amount.toLocaleString()} ব্যয় রেকর্ড হয়েছে (${newExpense.title})।`,
    });

    return newExpense;
  }

  // PRODUCTS & BATCHES
  public getProducts(): Product[] {
    return this.products.map((p) => {
      const sup = this.suppliers.find((s) => s.id === p.supplier_id);
      const pBatches = this.batches.filter((b) => b.product_id === p.id && b.is_active);
      const totalWarehouseStock = pBatches.reduce((acc, b) => acc + b.warehouse_qty, 0);
      return {
        ...p,
        stock: totalWarehouseStock,
        supplier_name: sup?.name,
        batches: pBatches,
      };
    });
  }

  public addProduct(prod: Omit<Product, 'id' | 'stock'>) {
    const newProd: Product = {
      ...prod,
      id: generateUUID(),
      stock: 0,
    };
    this.products.push(newProd);
    this.saveToStorage();
    syncRecordToCloud('products', newProd);

    broadcastLiveAlert({
      type: 'product',
      title: `নতুন ওষুধ যোগ করা হয়েছে: ${newProd.name}`,
      title_bn: `নতুন ওষুধ যোগ করা হয়েছে: ${newProd.name}`,
      description: `${newProd.name} (${newProd.sku_code}) সফলভাবে সিস্টেমে যুক্ত হয়েছে।`,
      description_bn: `${newProd.name} (${newProd.sku_code}) সফলভাবে সিস্টেমে যুক্ত হয়েছে।`,
    });

    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveToStorage();
    const updated = this.products.find((p) => p.id === id);
    if (updated) {
      syncRecordToCloud('products', updated);
    }
  }

  public getProductBatches(): ProductBatch[] {
    const today = new Date();
    return this.batches.map((b) => {
      const prod = this.products.find((p) => p.id === b.product_id);
      const expDate = new Date(b.exp_date);
      const diffTime = expDate.getTime() - today.getTime();
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...b,
        product_name: prod?.name,
        days_to_expiry: daysToExpiry,
      };
    });
  }

  public addBatch(batch: Omit<ProductBatch, 'id'>) {
    const newBatch: ProductBatch = {
      ...batch,
      id: generateUUID(),
    };
    this.batches.push(newBatch);
    this.saveToStorage();
    syncRecordToCloud('product_batches', newBatch);

    const prod = this.products.find((p) => p.id === batch.product_id);
    broadcastLiveAlert({
      type: 'stock',
      title: `নতুন ব্যাচ স্টক ইন: ${prod?.name || 'ওষুধ'}`,
      title_bn: `নতুন ব্যাচ স্টক ইন: ${prod?.name || 'ওষুধ'}`,
      description: `ব্যাচ #${newBatch.batch_no} (পরিমাণ: ${newBatch.warehouse_qty} পিস) সেন্ট্রাল গোডাউনে গৃহীত হয়েছে।`,
      description_bn: `ব্যাচ #${newBatch.batch_no} (পরিমাণ: ${newBatch.warehouse_qty} পিস) সেন্ট্রাল গোডাউনে গৃহীত হয়েছে।`,
    });

    return newBatch;
  }

  public moveBatchToQuarantine(batchId: string, qty: number, reason: string) {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return;

    const actualQty = Math.min(qty, batch.warehouse_qty);
    batch.warehouse_qty -= actualQty;

    const prod = this.products.find((p) => p.id === batch.product_id);
    const lossAmount = actualQty * batch.cost_price_dp;

    const entry: DamagedExpiredStock = {
      id: `dmg-${Date.now()}`,
      product_id: batch.product_id,
      batch_id: batch.id,
      qty: actualQty,
      reason: reason as any,
      loss_amount_at_dp: lossAmount,
      reported_by_emp_id: this.currentUser.emp_id,
      status: 'Kept_In_Quarantine',
      date_logged: new Date().toISOString().split('T')[0],
      product_name: prod?.name,
      batch_no: batch.batch_no,
    };

    this.damagedStock.push(entry);
    this.saveToStorage();
  }

  // EMPLOYEE VAN STOCK & TRANSFERS
  public getEmpStock(empId?: string): EmpStock[] {
    let list = this.empStock;
    if (empId) {
      list = list.filter((e) => e.emp_id === empId);
    }
    return list.map((es) => {
      const prod = this.products.find((p) => p.id === es.product_id);
      const batch = this.batches.find((b) => b.id === es.batch_id);
      return {
        ...es,
        product_name: prod?.name,
        batch_no: batch?.batch_no,
        tp: prod?.trade_price_tp,
      };
    });
  }

  public transferStockToEmployee(empId: string, productId: string, batchId: string, qty: number) {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch || batch.warehouse_qty < qty) {
      throw new Error('Not enough warehouse stock available in this batch');
    }

    batch.warehouse_qty -= qty;

    const existing = this.empStock.find(
      (e) => e.emp_id === empId && e.product_id === productId && e.batch_id === batchId
    );

    let targetEmpStock: EmpStock;
    if (existing) {
      existing.qty += qty;
      targetEmpStock = existing;
    } else {
      targetEmpStock = {
        id: generateUUID(),
        emp_id: empId,
        product_id: productId,
        batch_id: batchId,
        qty,
      };
      this.empStock.push(targetEmpStock);
    }

    const newTransfer = {
      id: generateUUID(),
      transfer_ref: `TRF-${Date.now().toString().slice(-6)}`,
      transfer_type: 'Warehouse_To_Employee' as const,
      emp_id: empId,
      product_id: productId,
      batch_id: batchId,
      qty,
      approved_by_emp_id: this.currentUser.emp_id,
      transfer_date: new Date().toISOString().split('T')[0],
    };
    this.stockTransfers.push(newTransfer);

    this.saveToStorage();
    syncRecordToCloud('product_batches', batch);
    syncRecordToCloud('emp_stock', targetEmpStock);
    syncRecordToCloud('stock_transfers', newTransfer);

    const prod = this.products.find((p) => p.id === productId);
    const emp = this.employees.find((e) => e.emp_id === empId);
    broadcastLiveAlert({
      type: 'stock',
      title: 'ফিল্ডে ওষুধ স্টক বিতরণ',
      title_bn: 'ফিল্ডে ওষুধ স্টক বিতরণ',
      description: `${emp?.name || empId}-কে ${prod?.name || 'ওষুধ'} ${qty} পিস হস্তান্তর করা হয়েছে (${newTransfer.transfer_ref})।`,
      description_bn: `${emp?.name || empId}-কে ${prod?.name || 'ওষুধ'} ${qty} পিস হস্তান্তর করা হয়েছে (${newTransfer.transfer_ref})।`,
    });
  }

  public transferStockBackToWarehouse(empId: string, productId: string, batchId: string, qty: number) {
    const existing = this.empStock.find(
      (e) => e.emp_id === empId && e.product_id === productId && e.batch_id === batchId
    );
    if (!existing || existing.qty < qty) {
      throw new Error('Employee does not hold this much stock');
    }

    existing.qty -= qty;
    const batch = this.batches.find((b) => b.id === batchId);
    if (batch) {
      batch.warehouse_qty += qty;
    }

    const newTransfer = {
      id: generateUUID(),
      transfer_ref: `RTN-${Date.now().toString().slice(-6)}`,
      transfer_type: 'Employee_Return_To_Warehouse' as const,
      emp_id: empId,
      product_id: productId,
      batch_id: batchId,
      qty,
      approved_by_emp_id: this.currentUser.emp_id,
      transfer_date: new Date().toISOString().split('T')[0],
    };
    this.stockTransfers.push(newTransfer);

    this.saveToStorage();
    syncRecordToCloud('emp_stock', existing);
    if (batch) syncRecordToCloud('product_batches', batch);
    syncRecordToCloud('stock_transfers', newTransfer);

    const prod = this.products.find((p) => p.id === productId);
    const emp = this.employees.find((e) => e.emp_id === empId);
    broadcastLiveAlert({
      type: 'stock',
      title: 'গোডাউনে স্টক ফেরত গৃহীত',
      title_bn: 'গোডাউনে স্টক ফেরত গৃহীত',
      description: `${emp?.name || empId}-এর নিকট হতে ${prod?.name || 'ওষুধ'} ${qty} পিস সেন্ট্রাল গোডাউনে গৃহীত হয়েছে (${newTransfer.transfer_ref})।`,
      description_bn: `${emp?.name || empId}-এর নিকট হতে ${prod?.name || 'ওষুধ'} ${qty} পিস সেন্ট্রাল গোডাউনে গৃহীত হয়েছে (${newTransfer.transfer_ref})।`,
    });
  }

  // POS BILLING & ORDERS (ATOMIC TRANSACTION)
  public completeSaleOrOrder(params: {
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    emp_id: string;
    stock_source: 'Employee_Stock' | 'Warehouse_Direct';
    order_status: 'Order_Booked' | 'Delivered_Final';
    items: {
      product_id: string;
      batch_id: string;
      qty: number;
      bonus_qty: number;
      unit_cost_dp: number;
      unit_price: number;
      discount_percent: number;
      total_price: number;
    }[];
    sub_total: number;
    discount_percent: number;
    discount_amount: number;
    net_payable: number;
    paid_amount: number;
    payment_method: any;
    notes?: string;
  }): Invoice {
    const cust = params.customer_id ? this.customers.find((c) => c.id === params.customer_id) : null;
    const emp = this.employees.find((e) => e.emp_id === params.emp_id);
    const mkt = cust ? this.markets.find((m) => m.id === cust.market_id) : null;

    const due_amount = Math.max(0, params.net_payable - params.paid_amount);
    const total_factory_cost = params.items.reduce(
      (acc, it) => acc + (it.qty + it.bonus_qty) * it.unit_cost_dp,
      0
    );

    const invoiceRef = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Format line items with names
    const fullItems = params.items.map((it) => {
      const prod = this.products.find((p) => p.id === it.product_id);
      const b = this.batches.find((batch) => batch.id === it.batch_id);
      return {
        ...it,
        product_name: prod?.name || 'Medicine',
        batch_no: b?.batch_no || 'Standard',
      };
    });

    const resolvedCustomerName = params.customer_name || cust?.shop_name || 'সাধারণ ক্রেতা';
    const resolvedCustomerPhone = params.customer_phone || cust?.phone || '';
    const resolvedCustomerAddress = params.customer_address || cust?.address || '';

    const newInvoice: Invoice = {
      id: generateUUID(),
      invoice_ref: invoiceRef,
      order_status: params.order_status,
      stock_source: params.stock_source,
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      emp_id: params.emp_id,
      customer_id: params.customer_id || 'direct-customer',
      market_id: cust?.market_id || null,
      sub_total: params.sub_total,
      discount_percent: params.discount_percent,
      discount_amount: params.discount_amount,
      net_payable: params.net_payable,
      paid_amount: params.paid_amount,
      due_amount: due_amount,
      total_factory_cost_dp: total_factory_cost,
      payment_status: due_amount === 0 ? 'Paid' : params.paid_amount > 0 ? 'Partial' : 'Due',
      payment_method: params.payment_method,
      notes: params.notes,
      customer_name: resolvedCustomerName,
      customer_phone: resolvedCustomerPhone,
      customer_address: resolvedCustomerAddress,
      employee_name: emp?.name,
      market_name: mkt?.name || 'সরাসরি বিক্রয়',
      items: fullItems,
    };

    // Deduct stock if Delivered_Final
    if (params.order_status === 'Delivered_Final') {
      params.items.forEach((item) => {
        const totalDeduct = item.qty + item.bonus_qty;
        if (params.stock_source === 'Employee_Stock') {
          const es = this.empStock.find(
            (e) => e.emp_id === params.emp_id && e.product_id === item.product_id && e.batch_id === item.batch_id
          );
          if (es) {
            es.qty = Math.max(0, es.qty - totalDeduct);
            syncRecordToCloud('emp_stock', es);
          } else {
            // If employee sold from available batch, also deduct from batch if not in bag
            const batch = this.batches.find((b) => b.id === item.batch_id);
            if (batch) {
              batch.warehouse_qty = Math.max(0, batch.warehouse_qty - totalDeduct);
              syncRecordToCloud('product_batches', batch);
            }
          }
        } else {
          const batch = this.batches.find((b) => b.id === item.batch_id);
          if (batch) {
            batch.warehouse_qty = Math.max(0, batch.warehouse_qty - totalDeduct);
            syncRecordToCloud('product_batches', batch);
          }
        }
      });
    }

    // Update Customer Baki Balance
    if (cust) {
      cust.current_due_balance += due_amount;
    }

    // Ledger Entry for Billed Amount
    this.ledger.unshift({
      id: `led-${Date.now()}-1`,
      date_time: new Date().toISOString(),
      date_only: new Date().toISOString().split('T')[0],
      account_type: 'Customer',
      customer_id: cust?.id,
      emp_id: params.emp_id,
      invoice_ref: invoiceRef,
      payment_method: params.payment_method,
      description: `New Bill Issued (${invoiceRef})`,
      debit: params.net_payable,
      credit: 0,
      balance: cust?.current_due_balance || 0,
      party_name: cust?.shop_name,
    });

    // Ledger Entry for Payment Received (if any)
    if (params.paid_amount > 0) {
      this.ledger.unshift({
        id: `led-${Date.now()}-2`,
        date_time: new Date().toISOString(),
        date_only: new Date().toISOString().split('T')[0],
        account_type: 'Customer',
        customer_id: cust?.id,
        emp_id: params.emp_id,
        invoice_ref: invoiceRef,
        payment_method: params.payment_method,
        description: `Payment Received on Bill (${invoiceRef})`,
        debit: 0,
        credit: params.paid_amount,
        balance: cust?.current_due_balance || 0,
        party_name: cust?.shop_name,
      });
    }

    this.invoices.unshift(newInvoice);
    this.saveToStorage();
    syncRecordToCloud('invoices', {
      id: newInvoice.id,
      invoice_ref: newInvoice.invoice_ref,
      order_status: newInvoice.order_status,
      stock_source: newInvoice.stock_source,
      date_time: newInvoice.date_time,
      date_only: newInvoice.date_only,
      emp_id: newInvoice.emp_id,
      customer_name: newInvoice.customer_name,
      customer_phone: newInvoice.customer_phone,
      customer_address: newInvoice.customer_address,
      sub_total: newInvoice.sub_total,
      discount_percent: newInvoice.discount_percent,
      discount_amount: newInvoice.discount_amount,
      net_payable: newInvoice.net_payable,
      paid_amount: newInvoice.paid_amount,
      due_amount: newInvoice.due_amount,
      total_factory_cost_dp: newInvoice.total_factory_cost_dp,
      payment_status: newInvoice.payment_status,
      payment_method: newInvoice.payment_method,
      notes: newInvoice.notes,
    });

    fullItems.forEach((item) => {
      syncRecordToCloud('sales', {
        id: generateUUID(),
        invoice_id: newInvoice.id,
        invoice_ref: newInvoice.invoice_ref,
        date_time: newInvoice.date_time,
        date_only: newInvoice.date_only,
        emp_id: newInvoice.emp_id,
        product_id: item.product_id,
        batch_id: item.batch_id,
        qty: item.qty,
        bonus_qty: item.bonus_qty,
        unit_cost_dp: item.unit_cost_dp,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        total_price: item.total_price,
        payment_status: newInvoice.payment_status,
      });
    });

    broadcastLiveAlert({
      type: 'invoice',
      title: `নতুন বিক্রয় ইনভয়েস: ${newInvoice.invoice_ref}`,
      title_bn: `নতুন বিক্রয় ইনভয়েস: ${newInvoice.invoice_ref}`,
      description: `${resolvedCustomerName}-এর জন্য ৳${newInvoice.net_payable.toLocaleString()} টাকার বিল নিশ্চিত হয়েছে (আদায়: ৳${newInvoice.paid_amount.toLocaleString()})।`,
      description_bn: `${resolvedCustomerName}-এর জন্য ৳${newInvoice.net_payable.toLocaleString()} টাকার বিল নিশ্চিত হয়েছে (আদায়: ৳${newInvoice.paid_amount.toLocaleString()})।`,
    });

    return newInvoice;
  }

  public getInvoices(): Invoice[] {
    return this.invoices;
  }

  public updateOrderStatus(invoiceId: string, newStatus: 'Packed_Ready' | 'Delivered_Final' | 'Cancelled') {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const oldStatus = inv.order_status;
    inv.order_status = newStatus;

    // If transitioning to Delivered_Final from Order_Booked/Packed_Ready, deduct warehouse stock
    if (newStatus === 'Delivered_Final' && oldStatus !== 'Delivered_Final') {
      inv.items?.forEach((item) => {
        const batch = this.batches.find((b) => b.id === item.batch_id);
        if (batch) {
          batch.warehouse_qty = Math.max(0, batch.warehouse_qty - (item.qty + item.bonus_qty));
          syncRecordToCloud('product_batches', batch);
        }
      });
    }

    this.saveToStorage();
    syncRecordToCloud('invoices', inv);
  }

  // PURCHASES (GRN)
  public getPurchases(): Purchase[] {
    return this.purchases;
  }

  public addPurchaseGRN(params: {
    supplier_id: string;
    factory_challan_no: string;
    items: {
      product_id: string;
      batch_no: string;
      exp_date: string;
      mfg_date?: string;
      received_qty: number;
      free_bonus_qty: number;
      unit_cost_dp: number;
      trade_price_tp: number;
      mrp: number;
    }[];
    paid_amount: number;
    notes?: string;
  }) {
    const sup = this.suppliers.find((s) => s.id === params.supplier_id);
    const receiveRef = `RCV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    let totalCost = 0;
    const purchaseItems: any[] = [];

    params.items.forEach((item) => {
      const lineCost = item.received_qty * item.unit_cost_dp;
      totalCost += lineCost;

      // Check if batch exists, or create new batch
      let batch = this.batches.find(
        (b) => b.product_id === item.product_id && b.batch_no.toLowerCase() === item.batch_no.toLowerCase()
      );

      if (batch) {
        batch.warehouse_qty += item.received_qty + item.free_bonus_qty;
        batch.exp_date = item.exp_date;
        syncRecordToCloud('product_batches', batch);
      } else {
        batch = {
          id: generateUUID(),
          product_id: item.product_id,
          batch_no: item.batch_no,
          mfg_date: item.mfg_date || null,
          exp_date: item.exp_date,
          cost_price_dp: item.unit_cost_dp,
          trade_price_tp: item.trade_price_tp,
          mrp: item.mrp,
          warehouse_qty: item.received_qty + item.free_bonus_qty,
          is_active: true,
        };
        this.batches.push(batch);
        syncRecordToCloud('product_batches', batch);
      }

      purchaseItems.push({
        id: `pi-${Date.now()}-${Math.random()}`,
        product_id: item.product_id,
        batch_id: batch.id,
        received_qty: item.received_qty,
        free_bonus_qty: item.free_bonus_qty,
        unit_cost_dp: item.unit_cost_dp,
        line_total_cost: lineCost,
      });
    });

    const dueAmount = Math.max(0, totalCost - params.paid_amount);
    if (sup) {
      sup.payable_balance += dueAmount;
    }

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      receive_ref: receiveRef,
      supplier_id: params.supplier_id,
      factory_challan_no: params.factory_challan_no,
      receive_date: new Date().toISOString().split('T')[0],
      total_cost_amount: totalCost,
      paid_amount: params.paid_amount,
      due_amount: dueAmount,
      notes: params.notes,
      created_by_emp_id: this.currentUser.emp_id,
      supplier_name: sup?.name,
      items: purchaseItems,
    };

    this.purchases.unshift(newPurchase);
    this.saveToStorage();
    return newPurchase;
  }

  // RETURNS & QUARANTINE
  public getReturns(): SalesReturn[] {
    return this.returns;
  }

  public getDamagedStock(): DamagedExpiredStock[] {
    return this.damagedStock;
  }

  public processReturn(params: {
    customer_id: string;
    product_id: string;
    batch_id: string;
    returned_qty: number;
    condition: 'Good_Resaleable' | 'Damaged_Broken' | 'Expired';
    credit_amount: number;
    notes?: string;
  }) {
    const cust = this.customers.find((c) => c.id === params.customer_id);
    const prod = this.products.find((p) => p.id === params.product_id);
    const batch = this.batches.find((b) => b.id === params.batch_id);

    if (cust) {
      cust.current_due_balance = Math.max(0, cust.current_due_balance - params.credit_amount);
    }

    if (params.condition === 'Good_Resaleable') {
      if (batch) {
        batch.warehouse_qty += params.returned_qty;
      }
    } else {
      this.damagedStock.push({
        id: `dmg-${Date.now()}`,
        product_id: params.product_id,
        batch_id: params.batch_id,
        qty: params.returned_qty,
        reason: 'Returned_Damaged_By_Pharmacy',
        loss_amount_at_dp: params.returned_qty * (batch?.cost_price_dp || 0),
        reported_by_emp_id: this.currentUser.emp_id,
        status: 'Kept_In_Quarantine',
        date_logged: new Date().toISOString().split('T')[0],
        product_name: prod?.name,
        batch_no: batch?.batch_no,
      });
    }

    const ret: SalesReturn = {
      id: `ret-${Date.now()}`,
      return_ref: `RTN-${Date.now().toString().slice(-6)}`,
      customer_id: params.customer_id,
      emp_id: this.currentUser.emp_id,
      product_id: params.product_id,
      batch_id: params.batch_id,
      returned_qty: params.returned_qty,
      condition: params.condition,
      credit_amount_reduced_from_due: params.credit_amount,
      return_date: new Date().toISOString().split('T')[0],
      notes: params.notes,
      customer_name: cust?.shop_name,
      product_name: prod?.name,
      batch_no: batch?.batch_no,
    };

    this.returns.unshift(ret);
    this.saveToStorage();
    return ret;
  }

  // LEDGER
  public getLedger(): LedgerEntry[] {
    return this.ledger;
  }

  // EXPENSES
  public getExpenses(): Expense[] {
    return this.expenses;
  }

  public addExpense(exp: Omit<Expense, 'id' | 'created_at'>) {
    const newExp: Expense = {
      ...exp,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      entered_by_name: this.currentUser.name,
      entered_by_emp_id: exp.entered_by_emp_id || this.currentUser.emp_id,
    };
    this.expenses.unshift(newExp);
    this.saveToStorage();
    syncRecordToCloud('expenses', newExp);

    broadcastLiveAlert({
      type: 'expense',
      title: `নতুন অফিস ব্যয়: ${newExp.title}`,
      title_bn: `নতুন অফিস ব্যয়: ${newExp.title}`,
      description: `৳${newExp.amount.toLocaleString()} ব্যয় লিপিবদ্ধ হয়েছে (${newExp.category} - ${newExp.payment_method})।`,
      description_bn: `৳${newExp.amount.toLocaleString()} ব্যয় লিপিবদ্ধ হয়েছে (${newExp.category} - ${newExp.payment_method})।`,
    });

    return newExp;
  }

  // ATTENDANCE & HR
  public getAttendance(date?: string): Attendance[] {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.employees.map((emp) => {
      const record = this.attendance.find((a) => a.emp_id === emp.emp_id && a.work_date === targetDate);
      const mkt = this.markets.find((m) => m.id === emp.primary_market_id);
      return {
        id: record?.id || `att-temp-${emp.emp_id}`,
        emp_id: emp.emp_id,
        work_date: targetDate,
        status: record ? record.status : 'Present_Market_Duty',
        ta_da_amount_earned: record ? record.ta_da_amount_earned : emp.daily_ta_da,
        employee_name: emp.name,
        employee_photo: emp.image_url,
        market_name: mkt?.name,
      };
    });
  }

  public markAttendance(empId: string, status: any, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const emp = this.employees.find((e) => e.emp_id === empId);
    const taDa = status === 'Present_Market_Duty' ? emp?.daily_ta_da || 350 : status === 'Present_Office' ? emp?.daily_ta_da || 300 : 0;

    let recToSync;
    const existingIndex = this.attendance.findIndex((a) => a.emp_id === empId && a.work_date === targetDate);
    if (existingIndex >= 0) {
      this.attendance[existingIndex].status = status;
      this.attendance[existingIndex].ta_da_amount_earned = taDa;
      recToSync = this.attendance[existingIndex];
    } else {
      recToSync = {
        id: generateUUID(),
        emp_id: empId,
        work_date: targetDate,
        status,
        ta_da_amount_earned: taDa,
        marked_by_emp_id: this.currentUser.emp_id,
        employee_name: emp?.name,
      };
      this.attendance.push(recToSync);
    }

    this.saveToStorage();
    syncRecordToCloud('attendance', recToSync);
  }

  // PAYROLL
  public getPayroll(): Payroll[] {
    return this.payroll;
  }

  public generateMonthlyPayroll(monthYear: string): Payroll[] {
    const generated: Payroll[] = this.employees.map((emp) => {
      // Find days marked present in month
      const empAttendances = this.attendance.filter((a) => a.emp_id === emp.emp_id && a.work_date.startsWith(monthYear));
      const workingDays = empAttendances.length || 26;
      const totalTaDa = empAttendances.reduce((acc, a) => acc + Number(a.ta_da_amount_earned || 0), 0) || emp.daily_ta_da * 26;

      // Invoices by employee in this month
      const empInvoices = this.invoices.filter((i) => i.emp_id === emp.emp_id && i.date_only.startsWith(monthYear));
      const totalSales = empInvoices.reduce((acc, i) => acc + Number(i.net_payable || 0), 0);
      const commission = (totalSales * (emp.commission_percent || 0)) / 100;

      const advanceDeducted = Math.min(emp.salary_advance_balance || 0, 3000);
      const netPayable = emp.base_salary + totalTaDa + commission - advanceDeducted;

      return {
        id: `pay-${monthYear}-${emp.emp_id}`,
        salary_month: monthYear,
        emp_id: emp.emp_id,
        working_days: workingDays,
        base_salary: emp.base_salary,
        total_ta_da_earned: totalTaDa,
        sales_commission_earned: commission,
        festival_or_extra_bonus: 0,
        advance_salary_deducted: advanceDeducted,
        net_salary_payable: netPayable,
        paid_amount: 0,
        payment_status: 'Unpaid',
        payment_method: 'Cash',
        employee_name: emp.name,
        designation: emp.designation,
      };
    });

    // Merge or save
    generated.forEach((newP) => {
      const idx = this.payroll.findIndex((p) => p.salary_month === newP.salary_month && p.emp_id === newP.emp_id);
      if (idx >= 0) {
        this.payroll[idx] = { ...newP, paid_amount: this.payroll[idx].paid_amount, payment_status: this.payroll[idx].payment_status };
      } else {
        this.payroll.push(newP);
      }
    });

    this.saveToStorage();
    return this.payroll;
  }

  public paySalary(payrollId: string, method: string = 'Cash') {
    const item = this.payroll.find((p) => p.id === payrollId);
    if (!item) return;

    item.paid_amount = item.net_salary_payable;
    item.payment_status = 'Paid';
    item.paid_date = new Date().toISOString().split('T')[0];
    item.payment_method = method;

    // Add to Company Expenses
    this.expenses.push({
      id: `exp-${Date.now()}`,
      expense_date: new Date().toISOString().split('T')[0],
      category: 'Salary_Payout',
      title: `Salary Disbursed: ${item.employee_name} (${item.salary_month})`,
      amount: item.net_salary_payable,
      payment_method: method,
      entered_by_name: this.currentUser.name,
    });

    this.saveToStorage();
  }

  // TARGETS
  public getTargets(): EmployeeTarget[] {
    return this.targets;
  }

  public getMonthlyTargetData() {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"

    const staffTargetTotal = this.targets
      .filter((t) => t.month_year === currentMonth)
      .reduce((acc, t) => acc + Number(t.target_sales_amount || 0), 0);

    const targetAmount = this.monthlySalesTarget > 0 ? this.monthlySalesTarget : staffTargetTotal;

    const currentMonthSales = this.invoices
      .filter((i) => i.date_only && i.date_only.startsWith(currentMonth) && i.order_status !== 'Cancelled')
      .reduce((acc, i) => acc + Number(i.net_payable || 0), 0);

    const currentMonthCollection = this.ledger
      .filter((l) => l.date_only && l.date_only.startsWith(currentMonth) && l.credit > 0)
      .reduce((acc, l) => acc + Number(l.credit || 0), 0);

    const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentMonthSales / targetAmount) * 100)) : 0;
    const remaining = targetAmount > 0 ? Math.max(0, targetAmount - currentMonthSales) : 0;

    return {
      currentMonth,
      targetAmount,
      currentMonthSales,
      currentMonthCollection,
      percentage,
      remaining,
      isTargetSet: targetAmount > 0,
    };
  }

  public setMonthlyCompanyTarget(amount: number) {
    this.monthlySalesTarget = Math.max(0, amount);
    this.saveToStorage();
    this.notify();
  }

  // REAL SALES VS COLLECTION TRENDS (100% ACCURATE METRICS)
  public getSalesVsCollectionTrends(range: 'today' | '7d' | '30d'): {
    bn: { name: string; Sales: number; Collection: number }[];
    en: { name: string; Sales: number; Collection: number }[];
    hasData: boolean;
  } {
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];

    if (range === 'today') {
      const slots = [
        { hour: 9, label_bn: 'সকাল ৯টা', label_en: '09:00 AM' },
        { hour: 11, label_bn: 'সকাল ১১টা', label_en: '11:00 AM' },
        { hour: 13, label_bn: 'দুপুর ১টা', label_en: '01:00 PM' },
        { hour: 15, label_bn: 'বিকাল ৩টা', label_en: '03:00 PM' },
        { hour: 18, label_bn: 'সন্ধ্যা ৬টা', label_en: '06:00 PM' },
      ];

      const todayInvoices = this.invoices.filter(
        (i) => i.date_only === todayDateStr && i.order_status !== 'Cancelled'
      );
      const todayLedger = this.ledger.filter(
        (l) => l.date_only === todayDateStr && l.credit > 0
      );

      let totalSales = 0;
      let totalColl = 0;

      const bn = slots.map((s, idx) => {
        const prevHour = idx === 0 ? 0 : slots[idx - 1].hour;
        const salesInSlot = todayInvoices
          .filter((i) => {
            const d = new Date(i.date_time);
            const h = isNaN(d.getTime()) ? 10 : d.getHours();
            return h > prevHour && h <= s.hour;
          })
          .reduce((acc, i) => acc + Number(i.net_payable || 0), 0);

        const collInSlot = todayLedger
          .filter((l) => {
            const d = new Date(l.date_time);
            const h = isNaN(d.getTime()) ? 10 : d.getHours();
            return h > prevHour && h <= s.hour;
          })
          .reduce((acc, l) => acc + Number(l.credit || 0), 0);

        totalSales += salesInSlot;
        totalColl += collInSlot;

        return { name: s.label_bn, Sales: salesInSlot, Collection: collInSlot };
      });

      const en = slots.map((s, idx) => {
        const prevHour = idx === 0 ? 0 : slots[idx - 1].hour;
        const salesInSlot = todayInvoices
          .filter((i) => {
            const d = new Date(i.date_time);
            const h = isNaN(d.getTime()) ? 10 : d.getHours();
            return h > prevHour && h <= s.hour;
          })
          .reduce((acc, i) => acc + Number(i.net_payable || 0), 0);

        const collInSlot = todayLedger
          .filter((l) => {
            const d = new Date(l.date_time);
            const h = isNaN(d.getTime()) ? 10 : d.getHours();
            return h > prevHour && h <= s.hour;
          })
          .reduce((acc, l) => acc + Number(l.credit || 0), 0);

        return { name: s.label_en, Sales: salesInSlot, Collection: collInSlot };
      });

      return { bn, en, hasData: totalSales > 0 || totalColl > 0 };
    }

    if (range === '7d') {
      const bnDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
      const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const bn: { name: string; Sales: number; Collection: number }[] = [];
      const en: { name: string; Sales: number; Collection: number }[] = [];
      let totalSales = 0;
      let totalColl = 0;

      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dStr = d.toISOString().split('T')[0];
        const dayIdx = d.getDay();

        const isToday = i === 0;
        const nameBn = isToday ? 'আজ' : bnDays[dayIdx];
        const nameEn = isToday ? 'Today' : enDays[dayIdx];

        const daySales = this.invoices
          .filter((inv) => inv.date_only === dStr && inv.order_status !== 'Cancelled')
          .reduce((acc, inv) => acc + Number(inv.net_payable || 0), 0);

        const dayColl = this.ledger
          .filter((l) => l.date_only === dStr && l.credit > 0)
          .reduce((acc, l) => acc + Number(l.credit || 0), 0);

        totalSales += daySales;
        totalColl += dayColl;

        bn.push({ name: nameBn, Sales: daySales, Collection: dayColl });
        en.push({ name: nameEn, Sales: daySales, Collection: dayColl });
      }

      return { bn, en, hasData: totalSales > 0 || totalColl > 0 };
    }

    // range === '30d' (4 Weeks)
    const bn: { name: string; Sales: number; Collection: number }[] = [];
    const en: { name: string; Sales: number; Collection: number }[] = [];
    let totalSales = 0;
    let totalColl = 0;

    const weeks = [
      { start: 28, end: 22, nameBn: '১ম সপ্তাহ', nameEn: 'Week 1' },
      { start: 21, end: 15, nameBn: '২য় সপ্তাহ', nameEn: 'Week 2' },
      { start: 14, end: 8, nameBn: '৩য় সপ্তাহ', nameEn: 'Week 3' },
      { start: 7, end: 0, nameBn: '৪র্থ সপ্তাহ', nameEn: 'Week 4' },
    ];

    for (const w of weeks) {
      const startD = new Date(Date.now() - w.start * 86400000).toISOString().split('T')[0];
      const endD = new Date(Date.now() - w.end * 86400000).toISOString().split('T')[0];

      const wSales = this.invoices
        .filter((inv) => inv.date_only >= startD && inv.date_only <= endD && inv.order_status !== 'Cancelled')
        .reduce((acc, inv) => acc + Number(inv.net_payable || 0), 0);

      const wColl = this.ledger
        .filter((l) => l.date_only >= startD && l.date_only <= endD && l.credit > 0)
        .reduce((acc, l) => acc + Number(l.credit || 0), 0);

      totalSales += wSales;
      totalColl += wColl;

      bn.push({ name: w.nameBn, Sales: wSales, Collection: wColl });
      en.push({ name: w.nameEn, Sales: wSales, Collection: wColl });
    }

    return { bn, en, hasData: totalSales > 0 || totalColl > 0 };
  }

  // METRICS & KPIS FOR DASHBOARD
  public getDashboardMetrics() {
    const today = new Date().toISOString().split('T')[0];

    // Today's Sales
    const todayInvoices = this.invoices.filter((i) => i.date_only === today && i.order_status !== 'Cancelled');
    const todaySalesAmount = todayInvoices.reduce((acc, i) => acc + Number(i.net_payable || 0), 0);
    const todaySalesCount = todayInvoices.length;

    // Today's Cash Collected (from invoices & ledger)
    const todayCollected = this.ledger
      .filter((l) => l.date_only === today && l.credit > 0)
      .reduce((acc, l) => acc + Number(l.credit || 0), 0);

    // Total Market Baki
    const totalDue = this.customers.reduce((acc, c) => acc + Number(c.current_due_balance || 0), 0);
    const duePharmaciesCount = this.customers.filter((c) => c.current_due_balance > 0).length;

    // Total Warehouse Stock Value (at TP)
    let warehouseStockValue = 0;
    let totalWarehouseBoxes = 0;
    this.batches.forEach((b) => {
      warehouseStockValue += b.warehouse_qty * b.trade_price_tp;
      totalWarehouseBoxes += b.warehouse_qty;
    });

    // Employee In-Hand Unsold Stock (Medicines taken by employees to sell)
    let totalEmployeeHeldBoxes = 0;
    let totalEmployeeHeldValue = 0;
    const empStockMap: Record<string, number> = {};
    this.empStock.forEach((es) => {
      const prod = this.products.find((p) => p.id === es.product_id);
      const tp = prod ? prod.trade_price_tp : 0;
      totalEmployeeHeldBoxes += es.qty;
      totalEmployeeHeldValue += es.qty * tp;
      empStockMap[es.emp_id] = (empStockMap[es.emp_id] || 0) + es.qty;
    });
    const employeesWithStockCount = Object.values(empStockMap).filter((q) => q > 0).length;
    const totalCombinedBoxes = totalWarehouseBoxes + totalEmployeeHeldBoxes;
    const totalCombinedStockValue = warehouseStockValue + totalEmployeeHeldValue;

    // Low Stock & Expiring Batches
    const todayDate = new Date();
    const nearExpiryBatches = this.batches.filter((b) => {
      const exp = new Date(b.exp_date);
      const diffDays = Math.ceil((exp.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && b.warehouse_qty > 0;
    });

    const lowStockProducts = this.products.filter((p) => p.stock <= p.low_stock_alert_level);

    // True Net Profit Calculation:
    // Net Sales (TP) - Factory Cost (DP) - Expenses - Damaged Loss
    const allSalesAtTP = this.invoices.reduce((acc, i) => acc + Number(i.net_payable || 0), 0);
    const allCostAtDP = this.invoices.reduce((acc, i) => acc + Number(i.total_factory_cost_dp || 0), 0);
    const allExpenses = this.expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const allLoss = this.damagedStock.reduce((acc, d) => acc + Number(d.loss_amount_at_dp || 0), 0);

    const netProfit = allSalesAtTP - allCostAtDP - allExpenses - allLoss;
    const profitMargin = allSalesAtTP > 0 ? ((netProfit / allSalesAtTP) * 100).toFixed(1) : '0';

    // Pending Pre-orders
    const pendingOrdersCount = this.invoices.filter((i) => i.order_status === 'Order_Booked').length;

    return {
      todaySalesAmount,
      todaySalesCount,
      todayCollected,
      totalDue,
      duePharmaciesCount,
      warehouseStockValue,
      totalWarehouseBoxes,
      totalEmployeeHeldBoxes,
      totalEmployeeHeldValue,
      employeesWithStockCount,
      totalCombinedBoxes,
      totalCombinedStockValue,
      expiringCount: nearExpiryBatches.length,
      lowStockCount: lowStockProducts.length,
      netProfit,
      profitMargin,
      pendingOrdersCount,
      nearExpiryBatches,
    };
  }

  // ALL DATA DUMP FOR 1-CLICK EXCEL BACKUP
  public getAllDataForBackup(): Record<string, any[]> {
    return {
      invoices: this.invoices,
      sales: this.invoices.flatMap((i) => i.items || []),
      products: this.products,
      product_batches: this.batches,
      customers: this.customers,
      employees: this.employees,
      markets: this.markets,
      suppliers: this.suppliers,
      doctors: this.doctors,
      doctor_expenses: this.doctorExpenses,
      purchases: this.purchases,
      purchase_items: this.purchases.flatMap((p) => p.items || []),
      emp_stock: this.empStock,
      stock_transfers: this.stockTransfers,
      sales_returns: this.returns,
      damaged_expired_stock: this.damagedStock,
      ledger: this.ledger,
      expenses: this.expenses,
      attendance: this.attendance,
      payroll: this.payroll,
    };
  }
}

// Global Singleton Instance
export const erpStore = new ERPStore();
