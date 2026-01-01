/**
 * 印章管理 API
 */

import { get, post, put, del, uploadFile, type ApiResponse, type PageResponse } from './api';

/**
 * 印章信息
 */
export interface Seal {
  id: number;
  sealName: string;
  sealType: number;
  sealTypeDesc: string;
  sealImage: string;
  sealImageUrl: string;
  ownerId: number;
  ownerType: number;
  ownerName?: string;
  status: number;
  remark?: string;
  createTime: string;
  updateTime: string;
}

/**
 * 印章创建请求
 */
export interface SealCreateRequest {
  sealName: string;
  sealType: number;
  sealImage: string;
  /** 印章来源: 1-上传 2-系统生成 3-模板 */
  sealSource: number;
  ownerId: number;
  ownerType: number;
  ownerName?: string;
  remark?: string;
}

/**
 * 印章来源
 */
export const SEAL_SOURCES = [
  { value: 1, label: '上传' },
  { value: 2, label: '系统生成' },
  { value: 3, label: '模板' },
] as const;

/**
 * 印章更新请求
 */
export interface SealUpdateRequest {
  sealName?: string;
  sealType?: number;
  sealImage?: string;
  remark?: string;
}

/**
 * 印章查询参数
 */
export interface SealQueryParams {
  ownerId?: number;
  ownerType?: number;
  sealType?: number;
  status?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  originalName: string;
  storedName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

/**
 * 印章模板
 */
export interface SealTemplate {
  code: string;
  name: string;
  baseSize: number;
  hasStar: boolean;
  fontName: string;
}

/**
 * 印章生成请求
 */
export interface SealGenerateRequest {
  companyName: string;
  centerText?: string;
  templateCode?: string;
  size?: number;
  color?: string;
}

// ==================== API 方法 ====================

/**
 * 获取印章列表（分页）
 */
export async function getSeals(params?: SealQueryParams): Promise<ApiResponse<PageResponse<Seal>>> {
  return get('/api/seals', params as Record<string, string | number | undefined>);
}

/**
 * 获取印章详情
 */
export async function getSealById(id: number): Promise<ApiResponse<Seal>> {
  return get(`/api/seals/${id}`);
}

/**
 * 创建印章
 */
export async function createSeal(data: SealCreateRequest): Promise<ApiResponse<Seal>> {
  return post('/api/seals', data);
}

/**
 * 更新印章
 */
export async function updateSeal(id: number, data: SealUpdateRequest): Promise<ApiResponse<Seal>> {
  return put(`/api/seals/${id}`, data);
}

/**
 * 删除印章
 */
export async function deleteSeal(id: number): Promise<ApiResponse<void>> {
  return del(`/api/seals/${id}`);
}

/**
 * 更新印章状态
 */
export async function updateSealStatus(id: number, status: number): Promise<ApiResponse<Seal>> {
  return put(`/api/seals/${id}/status?status=${status}`, undefined);
}

/**
 * 获取所有者的印章列表
 */
export async function getSealsByOwner(ownerId: number, ownerType: number): Promise<ApiResponse<Seal[]>> {
  return get(`/api/seals/owner/${ownerId}`, { ownerType });
}

/**
 * 上传印章图片
 */
export async function uploadSealImage(file: File): Promise<ApiResponse<FileUploadResponse>> {
  return uploadFile('/api/seals/upload', file);
}

/**
 * 生成印章
 */
export async function generateSeal(data: SealGenerateRequest): Promise<ApiResponse<FileUploadResponse>> {
  return post('/api/seals/generate', data);
}

/**
 * 获取印章模板列表
 */
export async function getSealTemplates(): Promise<ApiResponse<SealTemplate[]>> {
  return get('/api/seals/templates');
}

// ==================== 常量 ====================

/**
 * 印章类型
 */
export const SEAL_TYPES = [
  { value: 1, label: '企业公章' },
  { value: 2, label: '财务章' },
  { value: 3, label: '法人章' },
  { value: 4, label: '合同章' },
  { value: 5, label: '部门章' },
] as const;

/**
 * 印章状态
 */
export const SEAL_STATUS = [
  { value: 0, label: '禁用', color: 'gray' },
  { value: 1, label: '启用', color: 'green' },
] as const;

/**
 * 所有者类型
 */
export const OWNER_TYPES = [
  { value: 1, label: '企业' },
  { value: 2, label: '个人' },
] as const;
