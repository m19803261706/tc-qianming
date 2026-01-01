package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.dto.response.DashboardStatsResponse;
import cn.tcxingji.seal.repository.ContractFileRepository;
import cn.tcxingji.seal.repository.SealInfoRepository;
import cn.tcxingji.seal.repository.SealRecordRepository;
import cn.tcxingji.seal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

/**
 * 仪表盘服务实现类
 * <p>
 * 实现首页仪表盘统计数据查询逻辑
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final SealInfoRepository sealInfoRepository;
    private final ContractFileRepository contractFileRepository;
    private final SealRecordRepository sealRecordRepository;

    /**
     * 获取全局仪表盘统计数据
     * <p>
     * 统计所有数据（管理员视角）
     * </p>
     *
     * @return 统计数据响应
     */
    @Override
    public DashboardStatsResponse getStats() {
        log.debug("获取全局仪表盘统计数据");

        // 获取时间范围
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = getMonthStart(now);
        LocalDateTime monthEnd = getMonthEnd(now);
        LocalDateTime lastMonthStart = getLastMonthStart(now);
        LocalDateTime lastMonthEnd = getLastMonthEnd(now);

        // 统计印章数据
        long totalSeals = sealInfoRepository.count();
        // 启用的印章（status=1）- 使用 Specification 查询
        long enabledSeals = sealInfoRepository.count((root, query, cb) ->
                cb.equal(root.get("status"), 1));

        // 统计合同数据
        long totalContracts = contractFileRepository.count();
        // 待签合同（status=0）
        long pendingContracts = countPendingContracts();

        // 统计签章记录数据
        long totalSignatures = sealRecordRepository.count();
        long monthlySignatures = countSignaturesByTimeRange(monthStart, monthEnd);
        long lastMonthSignatures = countSignaturesByTimeRange(lastMonthStart, lastMonthEnd);

        // 本月新增印章（通过 createTime 字段）
        long monthlyNewSeals = countNewSealsByTimeRange(monthStart, monthEnd);

        return DashboardStatsResponse.builder()
                .totalSeals(totalSeals)
                .enabledSeals(enabledSeals)
                .pendingContracts(pendingContracts)
                .totalContracts(totalContracts)
                .monthlySignatures(monthlySignatures)
                .totalSignatures(totalSignatures)
                .monthlyNewSeals(monthlyNewSeals)
                .lastMonthSignatures(lastMonthSignatures)
                .build();
    }

    /**
     * 获取指定所有者的仪表盘统计数据
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 统计数据响应
     */
    @Override
    public DashboardStatsResponse getStatsByOwner(Long ownerId, Integer ownerType) {
        log.debug("获取所有者仪表盘统计数据: ownerId={}, ownerType={}", ownerId, ownerType);

        // 获取时间范围
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = getMonthStart(now);
        LocalDateTime monthEnd = getMonthEnd(now);
        LocalDateTime lastMonthStart = getLastMonthStart(now);
        LocalDateTime lastMonthEnd = getLastMonthEnd(now);

        // 统计印章数据
        long totalSeals = sealInfoRepository.countByOwnerIdAndOwnerType(ownerId, ownerType);
        // 启用的印章
        long enabledSeals = sealInfoRepository.count((root, query, cb) ->
                cb.and(
                        cb.equal(root.get("ownerId"), ownerId),
                        cb.equal(root.get("ownerType"), ownerType),
                        cb.equal(root.get("status"), 1)
                ));

        // 统计合同数据
        long totalContracts = contractFileRepository.countByOwnerId(ownerId);
        long pendingContracts = contractFileRepository.countByOwnerIdAndStatus(ownerId, 0);

        // 统计签章记录数据
        long totalSignatures = sealRecordRepository.countByOperatorId(ownerId);
        long monthlySignatures = sealRecordRepository.countByOperatorAndTimeRange(ownerId, monthStart, monthEnd);
        long lastMonthSignatures = sealRecordRepository.countByOperatorAndTimeRange(ownerId, lastMonthStart, lastMonthEnd);

        // 本月新增印章
        long monthlyNewSeals = countNewSealsByOwnerAndTimeRange(ownerId, ownerType, monthStart, monthEnd);

        return DashboardStatsResponse.builder()
                .totalSeals(totalSeals)
                .enabledSeals(enabledSeals)
                .pendingContracts(pendingContracts)
                .totalContracts(totalContracts)
                .monthlySignatures(monthlySignatures)
                .totalSignatures(totalSignatures)
                .monthlyNewSeals(monthlyNewSeals)
                .lastMonthSignatures(lastMonthSignatures)
                .build();
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 获取本月开始时间
     */
    private LocalDateTime getMonthStart(LocalDateTime now) {
        return now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
    }

    /**
     * 获取本月结束时间
     */
    private LocalDateTime getMonthEnd(LocalDateTime now) {
        return now.with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
    }

    /**
     * 获取上月开始时间
     */
    private LocalDateTime getLastMonthStart(LocalDateTime now) {
        return now.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
    }

    /**
     * 获取上月结束时间
     */
    private LocalDateTime getLastMonthEnd(LocalDateTime now) {
        return now.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
    }

    /**
     * 统计待签合同数量
     */
    private long countPendingContracts() {
        return contractFileRepository.findByStatus(0).size();
    }

    /**
     * 统计指定时间范围内的签章次数
     */
    private long countSignaturesByTimeRange(LocalDateTime start, LocalDateTime end) {
        return sealRecordRepository.findByTimeRange(start, end).size();
    }

    /**
     * 统计指定时间范围内的新增印章数量
     */
    private long countNewSealsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return sealInfoRepository.count((root, query, cb) ->
                cb.between(root.get("createTime"), start, end));
    }

    /**
     * 统计所有者在指定时间范围内的新增印章数量
     */
    private long countNewSealsByOwnerAndTimeRange(Long ownerId, Integer ownerType,
                                                   LocalDateTime start, LocalDateTime end) {
        return sealInfoRepository.count((root, query, cb) ->
                cb.and(
                        cb.equal(root.get("ownerId"), ownerId),
                        cb.equal(root.get("ownerType"), ownerType),
                        cb.between(root.get("createTime"), start, end)
                ));
    }
}
