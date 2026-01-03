/**
 * 用户管理 API
 *
 * 提供用户 CRUD 操作的 API 封装
 */

import { authRequest } from './api-client';

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

/**
 * 是否管理员枚举
 */
export enum IsAdmin {
  YES = 'YES',
  NO = 'NO',
}

/**
 * 用户信息
 */
export interface User {
  id: number;
  username: string;
  nickname: string | null;
  status: UserStatus;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建用户请求
 */
export interface CreateUserRequest {
  username: string;
  password: string;
  nickname?: string;
  isAdmin?: boolean;
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  nickname?: string;
  password?: string;
  status?: UserStatus;
  isAdmin?: boolean;
}

/**
 * API 响应结构
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 统一响应格式
 */
interface Response<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 获取用户列表
 */
export async function getUsers(): Promise<Response<User[]>> {
  try {
    const response = await authRequest<ApiResponse<User[]>>('/api/users');
    if (response.code === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return { success: false, message: '获取用户列表失败' };
  }
}

/**
 * 获取单个用户
 */
export async function getUser(id: number): Promise<Response<User>> {
  try {
    const response = await authRequest<ApiResponse<User>>(`/api/users/${id}`);
    if (response.code === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message };
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return { success: false, message: '获取用户详情失败' };
  }
}

/**
 * 创建用户
 */
export async function createUser(data: CreateUserRequest): Promise<Response<User>> {
  try {
    const response = await authRequest<ApiResponse<User>>('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.code === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message };
  } catch (error) {
    console.error('创建用户失败:', error);
    return { success: false, message: '创建用户失败' };
  }
}

/**
 * 更新用户
 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<Response<User>> {
  try {
    const response = await authRequest<ApiResponse<User>>(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.code === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message };
  } catch (error) {
    console.error('更新用户失败:', error);
    return { success: false, message: '更新用户失败' };
  }
}

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<Response<void>> {
  try {
    const response = await authRequest<ApiResponse<void>>(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (response.code === 200) {
      return { success: true };
    }
    return { success: false, message: response.message };
  } catch (error) {
    console.error('删除用户失败:', error);
    return { success: false, message: '删除用户失败' };
  }
}
