/**
 * 仪表盘 API 封装
 *
 * 提供首页仪表盘统计数据接口
 */

import { get, type ApiResponse } from './api';

/**
 * 仪表盘统计数据类型
 */
export interface DashboardStats {
  /** 印章总数 */
  totalSeals: number;
  /** 启用的印章数量 */
  enabledSeals: number;
  /** 待签合同数量 */
  pendingContracts: number;
  /** 合同总数 */
  totalContracts: number;
  /** 本月签章次数 */
  monthlySignatures: number;
  /** 签章记录总数 */
  totalSignatures: number;
  /** 本月新增印章数量 */
  monthlyNewSeals: number;
  /** 上月签章次数 */
  lastMonthSignatures: number;
  /** 本月签章同比增长百分比 */
  monthlySignatureGrowthPercent: number;
}

/**
 * 获取仪表盘统计数据（全局）
 *
 * @returns 统计数据响应
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return get<DashboardStats>('/api/dashboard/stats');
}

/**
 * 获取指定所有者的仪表盘统计数据
 *
 * @param ownerId 所有者ID
 * @param ownerType 所有者类型（1-企业 2-个人）
 * @returns 统计数据响应
 */
export async function getDashboardStatsByOwner(
  ownerId: number,
  ownerType: number = 1
): Promise<ApiResponse<DashboardStats>> {
  return get<DashboardStats>(`/api/dashboard/stats/owner/${ownerId}`, { ownerType });
}

/**
 * 格式化增长百分比显示
 *
 * @param percent 百分比数值
 * @returns 格式化后的字符串，如 "+15%" 或 "-5%"
 */
export function formatGrowthPercent(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) {
    return '0%';
  }
  const rounded = Math.round(percent);
  const prefix = rounded >= 0 ? '+' : '';
  return `${prefix}${rounded}%`;
}
