'use client';

import { useState } from 'react';
import { useAuth } from '../hooks';
import { isValidEmail, getPasswordStrength, mapAuthError } from '../utils';

interface RegisterFormProps {
  onSuccess?: () => void;
  defaultRole?: 'student' | 'teacher';
}

export function RegisterForm({ onSuccess, defaultRole = 'student' }: RegisterFormProps) {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setValidationError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setValidationError('Email không hợp lệ');
      return;
    }

    if (passwordStrength.score < 3) {
      setValidationError('Mật khẩu chưa đủ mạnh: ' + passwordStrength.feedback.join(', '));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'student' | 'teacher',
      });
      onSuccess?.();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        setValidationError(mapAuthError((err as { code: string }).code));
      }
    }
  };

  const displayError = validationError || error;

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            Họ
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Nguyễn"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Tên
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Văn A"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          autoComplete="new-password"
        />
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`flex-1 rounded-full ${
                    level <= passwordStrength.score
                      ? getStrengthColor(passwordStrength.score)
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {passwordStrength.feedback.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {passwordStrength.feedback[0]}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Xác nhận mật khẩu
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
    </form>
  );
}
