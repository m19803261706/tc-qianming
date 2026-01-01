package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.DashboardStatsResponse;
import cn.tcxingji.seal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 仪表盘控制器
 * <p>
 * 提供首页仪表盘统计数据 REST API 接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * 获取仪表盘统计数据
     * <p>
     * 返回全局统计数据（管理员视角）
     * </p>
     *
     * @return 统计数据响应
     */
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats() {
        log.debug("获取仪表盘统计数据");
        DashboardStatsResponse stats = dashboardService.getStats();
        return ApiResponse.success(stats);
    }

    /**
     * 获取指定所有者的仪表盘统计数据
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型（1-企业 2-个人）
     * @return 统计数据响应
     */
    @GetMapping("/stats/owner/{ownerId}")
    public ApiResponse<DashboardStatsResponse> getStatsByOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "1") Integer ownerType) {
        log.debug("获取所有者仪表盘统计数据: ownerId={}, ownerType={}", ownerId, ownerType);
        DashboardStatsResponse stats = dashboardService.getStatsByOwner(ownerId, ownerType);
        return ApiResponse.success(stats);
    }
}
