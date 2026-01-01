/**
 * 签名管理 API
 */

import { get, post, del, put, type ApiResponse, type PageResponse } from './api';

/**
 * 签名信息
 */
export interface Signature {
  id: number;
  /** 用户ID */
  userId: number;
  /** 签名名称 */
  signatureName: string;
  /** 签名图片路径 */
  signatureImage: string;
  /** 签名图片URL */
  signatureImageUrl?: string;
  /** 签名类型（1-上传图片 2-手写签名 3-字体生成） */
  signatureType: number;
  /** 签名类型描述 */
  signatureTypeDesc?: string;
  /** 字体名称 */
  fontName?: string;
  /** 字体颜色 */
  fontColor?: string;
  /** 签名文本内容 */
  textContent?: string;
  /** 是否默认签名（0-否 1-是） */
  isDefault: number;
  /** 状态（0-禁用 1-启用） */
  status: number;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 签名查询参数
 */
export interface SignatureQueryParams {
  userId?: number;
  keyword?: string;
  signatureType?: number;
  status?: number;
  page?: number;
  size?: number;
}

/**
 * 字体签名请求
 */
export interface FontSignatureRequest {
  userId: number;
  text: string;
  fontName: string;
  fontColor?: string;
  signatureName?: string;
}

/**
 * 手写签名请求
 */
export interface HandwriteSignatureRequest {
  userId: number;
  imageData: string;
  signatureName?: string;
}

/**
 * 可用字体信息
 */
export interface FontInfo {
  fontName: string;
  displayName: string;
  preview?: string;
}

// ==================== API 方法 ====================

/**
 * 获取签名列表（分页）
 */
export async function getSignatures(params?: SignatureQueryParams): Promise<ApiResponse<PageResponse<Signature>>> {
  return get('/api/signatures', params as Record<string, string | number | undefined>);
}

/**
 * 获取用户的所有签名
 */
export async function getSignaturesByUserId(userId: number): Promise<ApiResponse<Signature[]>> {
  return get(`/api/signatures/user/${userId}`);
}

/**
 * 获取用户的启用签名
 */
export async function getEnabledSignatures(userId: number): Promise<ApiResponse<Signature[]>> {
  return get(`/api/signatures/user/${userId}/enabled`);
}

/**
 * 获取用户的默认签名
 */
export async function getDefaultSignature(userId: number): Promise<ApiResponse<Signature | null>> {
  return get(`/api/signatures/user/${userId}/default`);
}

/**
 * 获取签名详情
 */
export async function getSignatureById(id: number): Promise<ApiResponse<Signature>> {
  return get(`/api/signatures/${id}`);
}

/**
 * 删除签名
 */
export async function deleteSignature(id: number): Promise<ApiResponse<void>> {
  return del(`/api/signatures/${id}`);
}

/**
 * 设置默认签名
 */
export async function setDefaultSignature(id: number, userId: number): Promise<ApiResponse<Signature>> {
  return put(`/api/signatures/${id}/default?userId=${userId}`, undefined);
}

/**
 * 更新签名状态
 */
export async function updateSignatureStatus(id: number, status: number): Promise<ApiResponse<Signature>> {
  return put(`/api/signatures/${id}/status?status=${status}`, undefined);
}

/**
 * 保存手写签名
 */
export async function saveHandwriteSignature(request: HandwriteSignatureRequest): Promise<ApiResponse<Signature>> {
  return post('/api/signatures/handwrite', request);
}

/**
 * 生成字体签名
 */
export async function generateFontSignature(request: FontSignatureRequest): Promise<ApiResponse<Signature>> {
  return post('/api/signatures/generate', request);
}

/**
 * 获取可用字体列表
 */
export async function getAvailableFonts(): Promise<ApiResponse<FontInfo[]>> {
  return get('/api/signatures/fonts');
}

// ==================== 常量 ====================

/**
 * 签名类型
 */
export const SIGNATURE_TYPES = [
  { value: 1, label: '上传图片', color: 'blue' },
  { value: 2, label: '手写签名', color: 'green' },
  { value: 3, label: '字体生成', color: 'purple' },
] as const;

/**
 * 签名状态
 */
export const SIGNATURE_STATUS = [
  { value: 0, label: '禁用', color: 'gray' },
  { value: 1, label: '启用', color: 'green' },
] as const;
