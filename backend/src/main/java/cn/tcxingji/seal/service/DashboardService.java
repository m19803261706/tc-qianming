package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.response.DashboardStatsResponse;

/**
 * 仪表盘服务接口
 * <p>
 * 提供首页仪表盘统计数据查询服务
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
public interface DashboardService {

    /**
     * 获取仪表盘统计数据
     * <p>
     * 统计印章数量、待签合同、本月签章等数据
     * </p>
     *
     * @return 统计数据响应
     */
    DashboardStatsResponse getStats();

    /**
     * 获取指定所有者的仪表盘统计数据
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型（1-企业 2-个人）
     * @return 统计数据响应
     */
    DashboardStatsResponse getStatsByOwner(Long ownerId, Integer ownerType);
}
