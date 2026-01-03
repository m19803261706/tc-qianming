/**
 * API 客户端
 *
 * 封装 fetch 请求，自动添加认证头和处理 401 响应
 */

import { API_BASE_URL, ApiResponse } from './api';
import { getToken, removeToken } from './auth-api';

/**
 * 请求选项
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  /** 是否需要认证（默认 true） */
  requireAuth?: boolean;
}

/**
 * 401 响应处理回调
 */
type UnauthorizedCallback = () => void;

let onUnauthorized: UnauthorizedCallback | null = null;

/**
 * 设置 401 响应处理回调
 * 通常由 AuthProvider 设置，用于跳转登录页
 */
export function setUnauthorizedCallback(callback: UnauthorizedCallback) {
  onUnauthorized = callback;
}

/**
 * 构建 URL 参数
 */
function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * 获取请求头
 */
function getHeaders(requireAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * 通用请求方法
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, body, requireAuth = true, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...getHeaders(requireAuth),
      ...(fetchOptions.headers as Record<string, string>),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 处理 401 未授权响应
  if (response.status === 401) {
    console.warn('[API Client] 收到 401 响应，清除认证状态');
    removeToken();
    if (onUnauthorized) {
      onUnauthorized();
    }
    return {
      code: 401,
      message: '登录已过期，请重新登录',
      data: null as unknown as T,
      success: false,
    };
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const result = await response.json();
  return {
    ...result,
    success: result.success ?? result.code === 200,
  };
}

/**
 * GET 请求（带认证）
 */
export async function authGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'GET', params });
}

/**
 * POST 请求（带认证）
 */
export async function authPost<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'POST', body: data });
}

/**
 * PUT 请求（带认证）
 */
export async function authPut<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'PUT', body: data });
}

/**
 * DELETE 请求（带认证）
 */
export async function authDelete<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'DELETE' });
}

/**
 * 文件上传（带认证）
 */
export async function authUpload<T>(
  path: string,
  file: File,
  fieldName = 'file'
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const url = buildUrl(path);
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  // 处理 401 未授权响应
  if (response.status === 401) {
    console.warn('[API Client] 收到 401 响应，清除认证状态');
    removeToken();
    if (onUnauthorized) {
      onUnauthorized();
    }
    return {
      code: 401,
      message: '登录已过期，请重新登录',
      data: null as unknown as T,
      success: false,
    };
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return {
    ...result,
    success: result.success ?? result.code === 200,
  };
}
