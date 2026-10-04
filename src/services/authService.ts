import { User, UserSession, CampusItem, RentalRequest } from '../types';
import { INITIAL_ITEMS, INITIAL_REQUESTS } from '../data/initialData';

const REGISTERED_USERS_KEY = 'campusshare_registered_users';
const FAILED_ATTEMPTS_KEY = 'campusshare_failed_login_attempts';
const SESSION_KEY = 'campusshare_active_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationCode?: string;
  year: string;
  rating: number;
  campusZone: string;
  createdAt: string;
}

interface FailedAttemptRecord {
  count: number;
  lockedUntil: number | null;
}

export class AuthService {
  // Get all registered users from storage
  private static getUsers(): RegisteredUserRecord[] {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Save registered users
  private static saveUsers(users: RegisteredUserRecord[]) {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  }

  // Get failed attempts
  private static getFailedAttempts(email: string): FailedAttemptRecord {
    try {
      const all = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
      return all[email.toLowerCase()] || { count: 0, lockedUntil: null };
    } catch {
      return { count: 0, lockedUntil: null };
    }
  }

  // Record failed attempt (rate limiting after 5 tries)
  private static recordFailedAttempt(email: string): { locked: boolean; remainingLockSeconds: number } {
    const key = email.toLowerCase();
    const all = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
    const current = all[key] || { count: 0, lockedUntil: null };

    current.count += 1;
    let locked = false;
    let remainingLockSeconds = 0;

    if (current.count >= 5) {
      // Lock for 60 seconds
      current.lockedUntil = Date.now() + 60 * 1000;
      locked = true;
      remainingLockSeconds = 60;
    }

    all[key] = current;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(all));
    return { locked, remainingLockSeconds };
  }

  // Reset failed attempts on success
  private static resetFailedAttempts(email: string) {
    const key = email.toLowerCase();
    const all = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
    delete all[key];
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(all));
  }

  // Register a new user
  static register(name: string, email: string, password: string): { success: boolean; user?: User; error?: string; verificationCode?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    const users = this.getUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    // Generate 6-digit email verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: RegisteredUserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: password, // In production this would be hashed server-side
      isVerified: false,
      verificationCode,
      year: '1st Year Student',
      rating: 5.0,
      campusZone: 'Main Tech Campus',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Initialize user-specific isolated data store
    this.initializeUserData(newUser.id, newUser.name);

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        isDemo: false,
        year: newUser.year,
        rating: newUser.rating,
        campusZone: newUser.campusZone,
        createdAt: newUser.createdAt,
      },
      verificationCode,
    };
  }

  // Verify email with 6-digit code
  static verifyEmail(email: string, code: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.email === cleanEmail);

    if (userIndex === -1) {
      return { success: false, error: 'User account not found.' };
    }

    const user = users[userIndex];
    if (user.verificationCode !== cleanCode) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    user.isVerified = true;
    delete user.verificationCode;
    users[userIndex] = user;
    this.saveUsers(users);

    return { success: true };
  }

  // Resend verification code
  static resendVerificationCode(email: string): { success: boolean; code?: string; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    this.saveUsers(users);

    return { success: true, code: newCode };
  }

  // Login
  static login(email: string, password: string, rememberMe: boolean = false): { success: boolean; session?: UserSession; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both your campus email and password.' };
    }

    // Check rate limit
    const failed = this.getFailedAttempts(cleanEmail);
    if (failed.lockedUntil && Date.now() < failed.lockedUntil) {
      const waitSeconds = Math.ceil((failed.lockedUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Too many failed login attempts (5/5). Account temporarily locked for security. Please try again in ${waitSeconds}s.`,
      };
    }

    const users = this.getUsers();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user || user.passwordHash !== cleanPassword) {
      const rateInfo = this.recordFailedAttempt(cleanEmail);
      if (rateInfo.locked) {
        return {
          success: false,
          error: `Too many failed login attempts. Account temporarily locked for 60 seconds.`,
        };
      }
      return {
        success: false,
        error: `Invalid credentials. (${5 - (failed.count + 1)} attempts remaining before temporary lockout).`,
      };
    }

    // Check email verification before first access
    if (!user.isVerified) {
      return {
        success: false,
        error: 'Email not verified. Please verify your email before first access.',
      };
    }

    // Reset failed counter on success
    this.resetFailedAttempts(cleanEmail);

    const sessionUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isDemo: false,
      year: user.year,
      rating: user.rating,
      campusZone: user.campusZone,
      createdAt: user.createdAt,
    };

    const session: UserSession = {
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user: sessionUser,
      expiresAt: Date.now() + SESSION_TIMEOUT_MS,
      rememberMe,
    };

    // Store active session
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, session };
  }

  // Demo Login (Triggered ONLY when user explicitly clicks "Demo Login" button)
  static loginDemo(): UserSession {
    const demoUser: User = {
      id: 'demo_student_guest',
      name: 'Alex Johnson (Demo Student)',
      email: 'alex.demo@campus.edu',
      isVerified: true,
      isDemo: true,
      year: '3rd Year • Computer Science',
      rating: 4.9,
      campusZone: 'Main Tech Campus',
      createdAt: new Date().toISOString(),
    };

    const session: UserSession = {
      token: `demo_sess_${Date.now()}`,
      user: demoUser,
      expiresAt: Date.now() + SESSION_TIMEOUT_MS,
      rememberMe: false,
    };

    // Initialize sample data specifically for demo user if not already set
    this.initializeDemoData();

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  // Request password reset
  static forgotPassword(email: string): { success: boolean; tempCode?: string; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account registered with this email.' };
    }

    const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = tempCode;
    this.saveUsers(users);

    return { success: true, tempCode };
  }

  // Reset password with code
  static resetPassword(email: string, code: string, newPass: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email === cleanEmail);

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.verificationCode !== code.trim()) {
      return { success: false, error: 'Invalid reset code.' };
    }

    user.passwordHash = newPass;
    delete user.verificationCode;
    this.saveUsers(users);
    this.resetFailedAttempts(cleanEmail);

    return { success: true };
  }

  // Get current active session (checks 30-min inactivity expiry)
  static getActiveSession(): UserSession | null {
    try {
      let raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        raw = localStorage.getItem(SESSION_KEY);
      }
      if (!raw) return null;

      const session: UserSession = JSON.parse(raw);
      if (!session || !session.expiresAt) return null;

      // Check if session expired due to 30 min of inactivity
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  // Touch / refresh session activity timer (resets the 30-min countdown)
  static touchSession(): void {
    try {
      const active = this.getActiveSession();
      if (!active) return;

      active.expiresAt = Date.now() + SESSION_TIMEOUT_MS;

      if (active.rememberMe) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(active));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(active));
      }
    } catch {}
  }

  // Logout - completely clears session, cached user tokens, and returns to login
  static logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  // ================= PER-USER ISOLATED DATA MANAGEMENT =================

  // User Items Store (isolated per user ID)
  static getUserItems(userId: string): CampusItem[] {
    try {
      const key = `campus_user_${userId}_items`;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  }

  static saveUserItems(userId: string, items: CampusItem[]): void {
    const key = `campus_user_${userId}_items`;
    localStorage.setItem(key, JSON.stringify(items));
  }

  // User Requests Store (isolated per user ID)
  static getUserRequests(userId: string): RentalRequest[] {
    try {
      const key = `campus_user_${userId}_requests`;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  }

  static saveUserRequests(userId: string, requests: RentalRequest[]): void {
    const key = `campus_user_${userId}_requests`;
    localStorage.setItem(key, JSON.stringify(requests));
  }

  // Public Campus Items (the marketplace catalog that everyone sees)
  static getPublicMarketplaceItems(): CampusItem[] {
    try {
      const data = localStorage.getItem('campusshare_public_marketplace');
      if (data) return JSON.parse(data);
      // Default public items
      localStorage.setItem('campusshare_public_marketplace', JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  }

  static savePublicMarketplaceItems(items: CampusItem[]): void {
    localStorage.setItem('campusshare_public_marketplace', JSON.stringify(items));
  }

  // Initialize a new regular user's data store
  private static initializeUserData(userId: string, userName: string): void {
    const keyItems = `campus_user_${userId}_items`;
    const keyRequests = `campus_user_${userId}_requests`;

    // Start clean for real users
    if (!localStorage.getItem(keyItems)) {
      localStorage.setItem(keyItems, JSON.stringify([]));
    }
    if (!localStorage.getItem(keyRequests)) {
      localStorage.setItem(keyRequests, JSON.stringify([]));
    }
  }

  // Initialize Demo user data store with rich sample items & requests
  private static initializeDemoData(): void {
    const demoId = 'demo_student_guest';
    const keyItems = `campus_user_${demoId}_items`;
    const keyRequests = `campus_user_${demoId}_requests`;

    if (!localStorage.getItem(keyItems)) {
      // Alex Johnson's listed items in demo mode
      const demoItems: CampusItem[] = [
        {
          id: 8,
          userId: demoId,
          name: 'Heavy Duty 6-Socket Surge Protector (3m Cable)',
          cat: 'Hostel',
          price: 20,
          weeklyDiscount: 20,
          deposit: 200,
          condition: 'Like new',
          owner: 'Alex Johnson (Demo Student)',
          ownerYear: '3rd Year • Computer Science',
          ownerRating: 4.9,
          ownerReviewsCount: 16,
          icon: '🔌',
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          imageResolution: '1K',
          desc: 'Universal 6-socket extension board with individual LED master switches. Great for hackathons and dorm room setups.',
          location: 'Computer Center Reception',
          available: true,
          rules: ['Max load 1500W', 'Do not plug room heaters into this board'],
          createdAt: '2026-10-02',
        },
      ];
      localStorage.setItem(keyItems, JSON.stringify(demoItems));
    }

    if (!localStorage.getItem(keyRequests)) {
      localStorage.setItem(keyRequests, JSON.stringify(INITIAL_REQUESTS));
    }
  }
}
