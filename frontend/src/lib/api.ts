/**
 * API 请求封装
 * 提供统一的 HTTP 请求方法
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 调试：打印 API 基础 URL
if (typeof window !== 'undefined') {
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] Env value:', process.env.NEXT_PUBLIC_API_URL);
}

/**
 * 通用响应类型
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp?: number;
}

/**
 * 分页响应类型
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 请求选项
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
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
  const finalUrl = url.toString();
  console.log('[API] buildUrl:', { path, API_BASE_URL, finalUrl });
  return finalUrl;
}

/**
 * 通用请求方法
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  // 根据 code 判断是否成功，添加 success 属性
  return {
    ...result,
    success: result.code === 200,
  };
}

/**
 * GET 请求
 */
export async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'GET', params });
}

/**
 * POST 请求
 */
export async function post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function put<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function del<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'DELETE' });
}

/**
 * 文件上传
 */
export async function uploadFile<T>(path: string, file: File, fieldName = 'file'): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const url = buildUrl(path);
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  // 根据 code 判断是否成功，添加 success 属性
  return {
    ...result,
    success: result.code === 200,
  };
}
