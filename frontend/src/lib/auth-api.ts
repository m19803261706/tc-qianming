/**
 * 认证 API 封装
 * 处理登录、登出、获取当前用户等认证相关操作
 */

import { API_BASE_URL, ApiResponse } from './api';

/** Token 存储 Key */
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string | null;
  status: number;
  isAdmin: boolean;
  createdAt: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

/**
 * 获取存储的 Token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 保存 Token
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 清除 Token
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * 获取存储的用户信息
 */
export function getStoredUser(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 保存用户信息
 */
export function setStoredUser(user: UserInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * 获取带认证的请求头
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const url = `${API_BASE_URL}/api/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  // 登录成功，保存 Token 和用户信息
  if (result.success && result.data) {
    setToken(result.data.token);
    setStoredUser(result.data.user);
  }

  return {
    ...result,
    success: result.success ?? result.code === 200,
  };
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  const token = getToken();

  // 调用后端登出接口（可选，JWT 无状态）
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // 忽略错误，继续清除本地数据
    }
  }

  // 清除本地存储
  removeToken();
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  const url = `${API_BASE_URL}/api/auth/me`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token 无效，清除本地存储
      removeToken();
      return {
        code: 401,
        message: '登录已过期',
        data: null as unknown as UserInfo,
        success: false,
      };
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  // 更新本地存储的用户信息
  if (result.success && result.data) {
    setStoredUser(result.data);
  }

  return {
    ...result,
    success: result.success ?? result.code === 200,
  };
}
