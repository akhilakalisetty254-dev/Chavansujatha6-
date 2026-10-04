export type Category = 'All' | 'Study' | 'Electronics' | 'Sports' | 'Hostel' | 'Books';

export type Condition = 'Like new' | 'Good' | 'Fair / Used';

export interface CampusItem {
  id: number;
  userId?: string; // ID of the real owner user
  name: string;
  cat: 'Study' | 'Electronics' | 'Sports' | 'Hostel' | 'Books';
  price: number; // ₹ per day
  weeklyDiscount?: number; // percentage, e.g. 20
  deposit: number; // ₹ security deposit
  condition: Condition;
  owner: string;
  ownerYear: string;
  ownerRating: number;
  ownerReviewsCount: number;
  icon: string;
  imageUrl?: string;
  imageResolution?: '1K' | '2K' | '4K';
  desc: string;
  location: string;
  available: boolean;
  rules?: string[];
  createdAt: string;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Active' | 'Returned' | 'Declined';

export interface RentalRequest {
  id: string;
  userId?: string; // The user ID who created or owns this request session
  itemId: number;
  itemName: string;
  itemImage?: string;
  itemIcon: string;
  owner: string;
  borrower: string;
  durationDays: number;
  durationLabel: string;
  startDate: string;
  pickupLocation: string;
  dailyPrice: number;
  deposit: number;
  totalRent: number;
  totalWithDeposit: number;
  status: RequestStatus;
  message: string;
  createdAt: string;
  isBorrowerMe: boolean;
}

export type TaskMode = 'fast' | 'general' | 'complex';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  taskMode?: TaskMode;
}

export interface DirectMessage {
  id: string;
  sender: 'me' | 'owner';
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isDemo: boolean;
  year: string;
  rating: number;
  campusZone: string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: User;
  expiresAt: number;
  rememberMe: boolean;
}

export type AppRoute = 'dashboard' | 'upload' | 'preview' | 'vault' | 'settings' | 'campusbot';
