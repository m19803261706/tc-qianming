/**
 * 用户管理 API 封装
 *
 * 调用后端用户 CRUD 接口
 */

import { ApiResponse } from './api';
import { authGet, authPost, authPut, authDelete } from './api-client';

/**
 * 用户信息类型
 */
export interface User {
  id: number;
  username: string;
  nickname: string | null;
  status: number;
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
  status?: number;
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  password?: string;
  nickname?: string;
  status?: number;
}

/**
 * 用户状态常量
 */
export const UserStatus = {
  DISABLED: 0,
  ENABLED: 1,
} as const;

/**
 * 用户状态文本
 */
export const UserStatusText: Record<number, string> = {
  [UserStatus.DISABLED]: '禁用',
  [UserStatus.ENABLED]: '启用',
};

/**
 * 获取用户列表
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  return authGet<User[]>('/api/users');
}

/**
 * 获取单个用户
 */
export async function getUser(id: number): Promise<ApiResponse<User>> {
  return authGet<User>(`/api/users/${id}`);
}

/**
 * 创建用户
 */
export async function createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
  return authPost<User>('/api/users', data);
}

/**
 * 更新用户
 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
  return authPut<User>(`/api/users/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return authDelete<void>(`/api/users/${id}`);
}
