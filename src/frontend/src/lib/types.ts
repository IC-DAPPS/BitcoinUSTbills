import type { Principal } from '@dfinity/principal';

// Re-export all types from the generated declaration file for convenience
export type {
  // Core service interface
  _SERVICE,

  // Core data structures
  USTBill,
  USTBillCreateRequest,
  USTBillStatus,
  User,
  UserRegistrationRequest,
  TokenHolding,
  HoldingStatus,
  YieldOption,

  // KYC and Authentication
  KYCStatus,

  // Trading and Finance
  TradingMetrics,
  YieldProjection,
  VerifiedBrokerPurchase,
  TreasuryRate,

  // Platform Management
  PlatformConfig,

  // API Response Types
  PaginatedResponse,
  HttpResponse,
  HttpHeader,
  TransformArgs,

  // Result Types
  Result,
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
  Result_6,
  Result_7,
  Result_8,

  // Error Types
  BitcoinUSTBillsError,

} from "../../../declarations/backend/backend.did";

// Additional frontend-specific types
export interface AppConfig {
  environment: "local" | "ic";
  canisterId: string;
}

export interface ApiResponse<T> {
  Ok?: T;
  Err?: BitcoinUSTBillsError;
}

// UI State Management Types
export interface DashboardData {
  user: User | null;
  holdings: TokenHolding[];
  availableUSTBills: USTBill[];
  totalPortfolioValue: number;
  totalYieldEarned: number;
  tradingMetrics: TradingMetrics;
}

export interface TransactionFormData {
  amount: string;
  ustbillId?: string;
  tokenAmount?: string;
}

export interface UserRegistrationFormData {
  email: string;
  phoneNumber?: string;
  country: string;
}

export interface USTBillCreateFormData {
  cusip: string;
  faceValue: string;
  purchasePrice: string;
  maturityDate: string;
  annualYield: string;
  totalTokens: string;
  issuer: string;
  billType: string;
}

// Form validation types
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Chart and Analytics Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface YieldChartData {
  historical: ChartDataPoint[];
  projected: ChartDataPoint[];
}

export interface PortfolioBreakdown {
  ustbillId: string;
  ustbillType: string;
  allocation: number;
  currentValue: number;
  yieldEarned: number;
}

// Notification and Status Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

export interface LoadingState {
  [key: string]: boolean;
}

// Filter and Search Types
export interface USTBillFilters {
  status?: USTBillStatus[];
  billType?: string[];
  minYield?: number;
  maxYield?: number;
  maturityRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  perPage: number;
}

// Investment Calculator Types
export interface InvestmentCalculation {
  purchaseCost: number;
  fees: number;
  totalCost: number;
  projectedYield: number;
  maturityValue: number;
  roi: number;
}

// Admin Panel Types
export interface AdminStats {
  totalUsers: number;
  totalUSTBills: number;
  totalTradingVolume: number;
  pendingKYC: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface KYCReviewData {
  user: User;
  documents: string[];
  notes: string;
  decision: KYCStatus;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type ApiCallStatus = 'idle' | 'loading' | 'success' | 'error';

// Theme and UI Types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface LayoutConfig {
  sidebarCollapsed: boolean;
  pageTitle: string;
  breadcrumbs: { label: string; href?: string }[];
}

// Error Boundary Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}

// Date and Time Utilities
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeseriesData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

// Websocket/Real-time Updates (for future use)
export interface RealtimeUpdate {
  type: 'price_update' | 'new_transaction' | 'status_change';
  data: any;
  timestamp: number;
}

export interface SubscriptionOptions {
  ustbillIds?: string[];
  userPrincipal?: Principal;
  eventTypes?: string[];
}

// Feature Flags (for gradual rollouts)
export interface FeatureFlags {
  [key: string]: boolean;
}

// Analytics and Tracking
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export interface UserActivity {
  action: string;
  resource: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Export convenience types for common patterns
export type USTBillWithAvailability = USTBill & {
  availableTokens: number;
  daysToMaturity: number;
};

export type UserWithPortfolio = User & {
  holdings: TokenHolding[];
  portfolioValue: number;
  portfolioBreakdown: PortfolioBreakdown[];
};

export type ExtendedTokenHolding = TokenHolding & {
  ustbill: USTBill;
  currentYield: number;
  daysHeld: number;
  roi: number;
};

// Constants for type guards
export const USTBillStatusValues = ['Active', 'SoldOut', 'Matured', 'Cancelled'] as const;
export const KYCStatusValues = ['Pending', 'Verified', 'Rejected', 'Expired'] as const;
export const HoldingStatusValues = ['Active', 'Sold', 'Matured', 'Cancelled'] as const;
export const YieldOptionValues = ['Maturity', 'Flexible'] as const;

// Type guards
export function isUSTBillStatus(value: any): value is USTBillStatus {
  return typeof value === 'object' && value !== null &&
    USTBillStatusValues.some(status => status in value);
}

export function isKYCStatus(value: any): value is KYCStatus {
  return typeof value === 'object' && value !== null &&
    KYCStatusValues.some(status => status in value);
}

export function isHoldingStatus(value: any): value is HoldingStatus {
  return typeof value === 'object' && value !== null &&
    HoldingStatusValues.some(status => status in value);
}

export function isYieldOption(value: any): value is YieldOption {
  return typeof value === 'object' && value !== null &&
    YieldOptionValues.some(option => option in value);
}

// Utility function to extract enum value
export function getEnumValue<T extends Record<string, null>>(enumObj: T): keyof T {
  return Object.keys(enumObj)[0] as keyof T;
}

// Error type helpers
export function isBitcoinUSTBillsError(value: any): value is BitcoinUSTBillsError {
  return typeof value === 'object' && value !== null &&
    Object.keys(value).length === 1;
}

export function isApiResponse<T>(value: any): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null &&
    ('Ok' in value || 'Err' in value);
}
