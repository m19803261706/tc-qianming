package cn.tcxingji.seal.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 签章记录实体类
 * <p>
 * 记录每次签章操作的详细信息，包括盖章位置、印章信息、操作人等
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "seal_record", indexes = {
        @Index(name = "idx_contract", columnList = "contract_id"),
        @Index(name = "idx_seal", columnList = "seal_id"),
        @Index(name = "idx_operator", columnList = "operator_id"),
        @Index(name = "idx_seal_time", columnList = "seal_time")
})
public class SealRecord {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 合同文件ID
     */
    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    /**
     * 印章ID
     */
    @Column(name = "seal_id", nullable = false)
    private Long sealId;

    /**
     * 盖章页码
     */
    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    /**
     * X坐标（距左边距离）
     */
    @Column(name = "position_x", nullable = false, precision = 10, scale = 2)
    private BigDecimal positionX;

    /**
     * Y坐标（距上边距离）
     */
    @Column(name = "position_y", nullable = false, precision = 10, scale = 2)
    private BigDecimal positionY;

    /**
     * 印章宽度（像素）
     */
    @Column(name = "seal_width", precision = 10, scale = 2)
    private BigDecimal sealWidth;

    /**
     * 印章高度（像素）
     */
    @Column(name = "seal_height", precision = 10, scale = 2)
    private BigDecimal sealHeight;

    /**
     * 签章类型
     * 1-普通章 2-骑缝章 3-个人签名
     */
    @Column(name = "seal_type", nullable = false, columnDefinition = "TINYINT")
    private Integer sealType;

    /**
     * 操作人ID
     */
    @Column(name = "operator_id", nullable = false)
    private Long operatorId;

    /**
     * 操作人姓名
     */
    @Column(name = "operator_name", length = 50)
    private String operatorName;

    /**
     * 签章时间
     */
    @Column(name = "seal_time")
    private LocalDateTime sealTime;

    /**
     * 创建时间
     */
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    /**
     * 插入前自动设置时间
     */
    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
        if (this.sealTime == null) {
            this.sealTime = LocalDateTime.now();
        }
    }

    /**
     * 更新前自动设置更新时间
     */
    @PreUpdate
    protected void onUpdate() {
        this.updateTime = LocalDateTime.now();
    }

    // ==================== 枚举常量 ====================

    /**
     * 签章类型枚举
     */
    public static class SealType {
        /** 普通章 - 在指定位置盖章 */
        public static final int NORMAL = 1;
        /** 骑缝章 - 跨页盖章，用于防止替换页面 */
        public static final int PERFORATION = 2;
        /** 个人签名 - 手写签名 */
        public static final int PERSONAL_SIGNATURE = 3;
    }
}
