/**
 * 签名管理 API
 */

import { get, post, del, put, type ApiResponse, type PageResponse } from './api';

/**
 * 签名信息
 */
export interface Signature {
  id: number;
  userId: number;
  signatureName: string;
  signatureImage: string;
  signatureImageUrl: string;
  signatureType: number;
  signatureTypeDesc: string;
  fontName?: string;
  fontColor?: string;
  textContent?: string;
  isDefault: number;
  status: number;
  createTime: string;
  updateTime: string;
}

/**
 * 字体信息
 */
export interface FontInfo {
  fontName: string;
  displayName: string;
  available: boolean;
  sample?: string;
}

/**
 * 签名查询参数
 */
export interface SignatureQueryParams {
  userId?: number;
  signatureType?: number;
  status?: number;
  page?: number;
  size?: number;
}

/**
 * 手写签名请求
 */
export interface HandwriteSignatureRequest {
  userId: number;
  imageData: string; // Base64 图片数据
  name?: string;
  setDefault?: boolean;
  createBy?: string;
}

/**
 * 字体签名请求
 */
export interface FontSignatureRequest {
  userId: number;
  text: string;
  fontName: string;
  fontColor?: string;
  fontSize?: number;
  signatureName?: string;
  setDefault?: boolean;
  createBy?: string;
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
export async function getEnabledSignaturesByUserId(userId: number): Promise<ApiResponse<Signature[]>> {
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
  { value: 1, label: '上传图片' },
  { value: 2, label: '手写签名' },
  { value: 3, label: '字体生成' },
] as const;

/**
 * 签名状态
 */
export const SIGNATURE_STATUS = [
  { value: 0, label: '禁用', color: 'gray' },
  { value: 1, label: '启用', color: 'green' },
] as const;

/**
 * 默认字体颜色选项
 */
export const SIGNATURE_COLORS = [
  { name: '黑色', value: '#000000' },
  { name: '蓝色', value: '#1E40AF' },
  { name: '深蓝', value: '#1E3A8A' },
  { name: '红色', value: '#DC2626' },
] as const;
