const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ============ Token Management ============

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function removeTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ============ Error Mapping ============

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Không tìm thấy tài khoản',
  EMAIL_EXISTS: 'Email đã được sử dụng',
  WEAK_PASSWORD: 'Mật khẩu quá yếu',
  INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn',
  ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi, vui lòng thử lại',
};

export function mapAuthError(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============ Validation ============

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Tối thiểu 8 ký tự');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Cần có chữ hoa');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Cần có chữ thường');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Cần có số');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Nên có ký tự đặc biệt');

  return { score, feedback };
}
