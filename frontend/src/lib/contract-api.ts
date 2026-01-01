/**
 * 合同管理 API
 */

import { get, post, del, put, API_BASE_URL, type ApiResponse, type PageResponse } from './api';

/**
 * 合同信息
 */
export interface Contract {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  totalPages: number;
  ownerId: number;
  ownerType: number;
  status: number;
  statusDesc: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

/**
 * 合同预览响应
 */
export interface ContractPreview {
  contractId: number;
  fileName: string;
  totalPages: number;
  currentPage: number;
  previewUrls: string[];
  previewUrl?: string;
  width: number;
  height: number;
}

/**
 * 盖章位置请求
 */
export interface SealPosition {
  pageNumber: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * 盖章请求
 */
export interface ContractSealRequest {
  sealId: number;
  positions: SealPosition[];
  operatorId: number;
  operatorName?: string;
  sealType?: number; // 1-普通章 2-骑缝章 3-个人签名
}

/**
 * 盖章响应
 */
export interface ContractSealResponse {
  contractId: number;
  sealCount: number;
  previewUrl: string;
  message: string;
}

/**
 * 签章记录
 */
export interface SealRecord {
  id: number;
  contractId: number;
  sealId: number;
  sealName: string;
  sealImageUrl: string;
  pageNumber: number;
  positionX: number;
  positionY: number;
  sealWidth: number;
  sealHeight: number;
  sealType: number;
  sealTypeDesc: string;
  operatorId: number;
  operatorName: string;
  createTime: string;
}

/**
 * 合同查询参数
 */
export interface ContractQueryParams {
  ownerId?: number;
  ownerType?: number;
  status?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

/**
 * 骑缝章请求
 */
export interface PerforationSealRequest {
  sealId: number;
  operatorId: number;
  operatorName?: string;
  yPosition?: number;
  sealSize?: number;
}

// ==================== API 方法 ====================

/**
 * 上传合同
 * 使用 API_BASE_URL 从 ./api 导入，避免硬编码
 */
export async function uploadContract(
  file: File,
  ownerId: number,
  ownerType: number = 1,
  remark?: string
): Promise<ApiResponse<Contract>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ownerId', String(ownerId));
  formData.append('ownerType', String(ownerType));
  if (remark) {
    formData.append('remark', remark);
  }

  const response = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  // 添加 success 属性保持一致性
  return {
    ...result,
    success: result.code === 200,
  };
}

/**
 * 获取合同列表（分页）
 */
export async function getContracts(params?: ContractQueryParams): Promise<ApiResponse<PageResponse<Contract>>> {
  return get('/api/contracts', params as Record<string, string | number | undefined>);
}

/**
 * 获取合同详情
 */
export async function getContractById(id: number): Promise<ApiResponse<Contract>> {
  return get(`/api/contracts/${id}`);
}

/**
 * 删除合同
 */
export async function deleteContract(id: number): Promise<ApiResponse<void>> {
  return del(`/api/contracts/${id}`);
}

/**
 * 更新合同状态
 */
export async function updateContractStatus(id: number, status: number): Promise<ApiResponse<Contract>> {
  return put(`/api/contracts/${id}/status?status=${status}`, undefined);
}

/**
 * 预览合同（所有页）
 */
export async function previewContract(id: number): Promise<ApiResponse<ContractPreview>> {
  return get(`/api/contracts/${id}/preview`);
}

/**
 * 预览合同指定页
 */
export async function previewContractPage(id: number, page: number): Promise<ApiResponse<ContractPreview>> {
  return get(`/api/contracts/${id}/preview/${page}`);
}

/**
 * 执行盖章
 */
export async function sealContract(id: number, request: ContractSealRequest): Promise<ApiResponse<ContractSealResponse>> {
  return post(`/api/contracts/${id}/seal`, request);
}

/**
 * 批量盖章
 */
export async function batchSealContract(id: number, requests: ContractSealRequest[]): Promise<ApiResponse<ContractSealResponse>> {
  return post(`/api/contracts/${id}/seal/batch`, requests);
}

/**
 * 获取签章记录
 */
export async function getSealRecords(contractId: number): Promise<ApiResponse<SealRecord[]>> {
  return get(`/api/contracts/${contractId}/seal/records`);
}

/**
 * 添加骑缝章
 */
export async function addPerforationSeal(id: number, request: PerforationSealRequest): Promise<ApiResponse<ContractSealResponse>> {
  return post(`/api/contracts/${id}/seal/perforation`, request);
}

/**
 * 根据所有者查询合同
 */
export async function getContractsByOwner(ownerId: number, ownerType: number = 1): Promise<ApiResponse<Contract[]>> {
  return get(`/api/contracts/owner/${ownerId}`, { ownerType });
}

// ==================== 常量 ====================

/**
 * 合同状态
 */
export const CONTRACT_STATUS = [
  { value: 0, label: '待处理', color: 'gray' },
  { value: 1, label: '待签章', color: 'yellow' },
  { value: 2, label: '已签章', color: 'green' },
  { value: 3, label: '已归档', color: 'blue' },
] as const;
