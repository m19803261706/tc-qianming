'use client';

/**
 * 认证上下文
 *
 * 提供全局的认证状态管理，包括：
 * - 用户信息
 * - Token 管理
 * - 登录/登出方法
 * - 页面加载时自动恢复状态
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserInfo,
  LoginRequest,
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  getToken,
  getStoredUser,
  isAuthenticated as checkAuth,
} from '@/lib/auth-api';

/**
 * 认证状态类型
 */
interface AuthState {
  /** 当前用户信息 */
  user: UserInfo | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载（检查认证状态） */
  isLoading: boolean;
  /** 登录方法 */
  login: (data: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  /** 登出方法 */
  logout: () => Promise<void>;
  /** 刷新用户信息 */
  refreshUser: () => Promise<void>;
}

/**
 * 创建认证上下文
 */
const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * 认证 Provider 组件
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初始化：检查本地存储的认证状态
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 检查是否有 Token
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // 尝试从本地存储恢复用户信息
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }

        // 从服务器验证并获取最新用户信息
        const response = await getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // Token 无效，清除状态
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (data: LoginRequest) => {
    try {
      const response = await apiLogin(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message || '登录失败' };
    } catch (error) {
      console.error('登录错误:', error);
      return { success: false, message: '网络错误，请稍后重试' };
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的 Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
