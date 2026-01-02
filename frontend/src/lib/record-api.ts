/**
 * 签章记录 API 封装
 * 提供签章记录的查询接口
 */

import { get, type ApiResponse, type PageResponse } from './api';

/**
 * 签章记录类型
 */
export interface SealRecord {
  /** 记录ID */
  id: number;
  /** 合同ID */
  contractId: number;
  /** 印章ID */
  sealId: number;
  /** 盖章页码 */
  pageNumber: number;
  /** X坐标 */
  positionX: number;
  /** Y坐标 */
  positionY: number;
  /** 印章宽度 */
  sealWidth: number;
  /** 印章高度 */
  sealHeight: number;
  /** 签章类型：1-普通章 2-骑缝章 3-个人签名 */
  sealType: number;
  /** 签章类型描述 */
  sealTypeText: string;
  /** 操作人ID */
  operatorId: number;
  /** 操作人姓名 */
  operatorName: string;
  /** 签章时间 */
  sealTime: string;
}

/**
 * 签章记录查询参数
 */
export interface RecordQueryParams {
  /** 页码（从1开始） */
  page?: number;
  /** 每页数量 */
  size?: number;
  /** 签章类型：1-普通章 2-骑缝章 3-个人签名 */
  sealType?: number;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 搜索关键词（操作人姓名） */
  keyword?: string;
}

/**
 * 签章统计数据
 */
export interface RecordStats {
  /** 总签章次数 */
  totalRecords: number;
  /** 普通章次数 */
  normalSeals: number;
  /** 骑缝章次数 */
  perforationSeals: number;
  /** 个人签名次数 */
  personalSignatures: number;
}

/**
 * 签章类型常量
 */
export const SEAL_TYPES = [
  { value: 1, label: '普通章', color: 'blue' },
  { value: 2, label: '骑缝章', color: 'orange' },
  { value: 3, label: '个人签名', color: 'green' },
] as const;

/**
 * 获取签章类型标签
 */
export function getSealTypeLabel(type: number): { label: string; color: string } {
  const found = SEAL_TYPES.find(t => t.value === type);
  return found || { label: '未知', color: 'gray' };
}

/**
 * 获取签章记录列表
 *
 * @param params 查询参数
 * @returns 签章记录分页列表
 */
export async function getRecords(
  params: RecordQueryParams = {}
): Promise<ApiResponse<PageResponse<SealRecord>>> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page ?? 1,
    size: params.size ?? 10,
    sealType: params.sealType,
    startDate: params.startDate,
    endDate: params.endDate,
    keyword: params.keyword,
  };
  return get('/api/records', queryParams);
}

/**
 * 获取签章记录详情
 *
 * @param id 记录ID
 * @returns 签章记录详情
 */
export async function getRecord(id: number): Promise<ApiResponse<SealRecord>> {
  return get(`/api/records/${id}`);
}

/**
 * 获取签章统计数据
 *
 * @returns 统计数据
 */
export async function getRecordStats(): Promise<ApiResponse<RecordStats>> {
  return get('/api/records/stats');
}
