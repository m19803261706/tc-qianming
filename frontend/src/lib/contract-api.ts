/**
 * 合同管理 API
 */

import { get, post, del, put, API_BASE_URL, type ApiResponse, type PageResponse } from './api';

/**
 * 合同信息
 */
export interface Contract {
  id: number;
  /** 合同名称（用户自定义的显示名称，如果没有设置则使用原始文件名） */
  contractName: string;
  /** 原始上传的文件名 */
  fileName: string;
  /** 原始文件 URL */
  originalUrl: string;
  /** 签章后文件 URL */
  signedUrl?: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 文件大小（可读格式） */
  fileSizeReadable?: string;
  /** PDF 页数 */
  pageCount: number;
  /** 文件哈希值 */
  fileHash?: string;
  /** 状态（0-待签章 1-签章中 2-已签章 3-已作废） */
  status: number;
  /** 状态描述 */
  statusText?: string;
  /** 所有者 ID */
  ownerId: number;
  /** 所有者类型 */
  ownerType: number;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
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
 *
 * 支持两种模式：
 * - 印章模式(sealType=1,2)：使用 sealId
 * - 签名模式(sealType=3)：使用 signatureId
 */
export interface ContractSealRequest {
  /** 印章 ID（sealType=1,2 时必填） */
  sealId?: number;
  /** 个人签名 ID（sealType=3 时必填） */
  signatureId?: number;
  /** 盖章位置列表 */
  positions: SealPosition[];
  /** 操作人 ID */
  operatorId: number;
  /** 操作人姓名 */
  operatorName?: string;
  /** 签章类型（1-普通章 2-骑缝章 3-个人签名） */
  sealType?: number;
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
 *
 * @param file PDF 文件
 * @param ownerId 所有者 ID
 * @param ownerType 所有者类型（1-企业 2-个人）
 * @param contractName 合同名称（可选，不填则使用文件名）
 * @param remark 备注（可选）
 */
export async function uploadContract(
  file: File,
  ownerId: number,
  ownerType: number = 1,
  contractName?: string,
  remark?: string
): Promise<ApiResponse<Contract>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ownerId', String(ownerId));
  formData.append('ownerType', String(ownerType));
  if (contractName) {
    formData.append('contractName', contractName);
  }
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
