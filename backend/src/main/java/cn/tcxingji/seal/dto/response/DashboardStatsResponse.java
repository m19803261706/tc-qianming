package cn.tcxingji.seal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 仪表盘统计数据响应
 * <p>
 * 包含首页仪表盘展示所需的各项统计数据
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    /**
     * 印章总数
     */
    private Long totalSeals;

    /**
     * 启用的印章数量
     */
    private Long enabledSeals;

    /**
     * 待签合同数量
     */
    private Long pendingContracts;

    /**
     * 合同总数
     */
    private Long totalContracts;

    /**
     * 本月签章次数
     */
    private Long monthlySignatures;

    /**
     * 签章记录总数
     */
    private Long totalSignatures;

    /**
     * 本月新增印章数量
     */
    private Long monthlyNewSeals;

    /**
     * 上月签章次数（用于计算同比）
     */
    private Long lastMonthSignatures;

    /**
     * 计算本月签章同比增长百分比
     *
     * @return 同比增长百分比（正数为增长，负数为下降）
     */
    public Double getMonthlySignatureGrowthPercent() {
        if (lastMonthSignatures == null || lastMonthSignatures == 0) {
            return monthlySignatures != null && monthlySignatures > 0 ? 100.0 : 0.0;
        }
        return ((double) (monthlySignatures - lastMonthSignatures) / lastMonthSignatures) * 100;
    }
}
