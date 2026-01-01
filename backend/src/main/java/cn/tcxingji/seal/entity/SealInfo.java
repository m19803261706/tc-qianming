package cn.tcxingji.seal.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 印章信息实体类
 * <p>
 * 存储企业公章、合同专用章、财务章、个人签名章等印章数据
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
@Table(name = "seal_info", indexes = {
        @Index(name = "idx_owner", columnList = "owner_id, owner_type"),
        @Index(name = "idx_type", columnList = "seal_type"),
        @Index(name = "idx_status", columnList = "status")
})
public class SealInfo {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 印章名称
     */
    @Column(name = "seal_name", nullable = false, length = 100)
    private String sealName;

    /**
     * 印章类型
     * 1-企业公章 2-合同专用章 3-财务章 4-个人签名
     */
    @Column(name = "seal_type", nullable = false, columnDefinition = "TINYINT")
    private Integer sealType;

    /**
     * 印章图片路径
     */
    @Column(name = "seal_image", nullable = false, length = 500)
    private String sealImage;

    /**
     * 印章来源
     * 1-上传 2-系统生成 3-模板
     */
    @Column(name = "seal_source", nullable = false, columnDefinition = "TINYINT")
    private Integer sealSource;

    /**
     * 所有者ID
     */
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    /**
     * 所有者类型
     * 1-企业 2-个人
     */
    @Column(name = "owner_type", nullable = false, columnDefinition = "TINYINT")
    private Integer ownerType;

    /**
     * 状态
     * 0-禁用 1-启用
     */
    @Column(name = "status", columnDefinition = "TINYINT")
    @Builder.Default
    private Integer status = 1;

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
     * 创建人
     */
    @Column(name = "create_by", length = 50)
    private String createBy;

    /**
     * 更新人
     */
    @Column(name = "update_by", length = 50)
    private String updateBy;

    /**
     * 插入前自动设置创建时间
     */
    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
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
     * 印章类型枚举
     */
    public static class SealType {
        /** 企业公章 */
        public static final int COMPANY_SEAL = 1;
        /** 合同专用章 */
        public static final int CONTRACT_SEAL = 2;
        /** 财务章 */
        public static final int FINANCE_SEAL = 3;
        /** 个人签名 */
        public static final int PERSONAL_SIGNATURE = 4;
    }

    /**
     * 印章来源枚举
     */
    public static class SealSource {
        /** 上传 */
        public static final int UPLOAD = 1;
        /** 系统生成 */
        public static final int GENERATED = 2;
        /** 模板 */
        public static final int TEMPLATE = 3;
    }

    /**
     * 所有者类型枚举
     */
    public static class OwnerType {
        /** 企业 */
        public static final int ENTERPRISE = 1;
        /** 个人 */
        public static final int PERSONAL = 2;
    }

    /**
     * 状态枚举
     */
    public static class Status {
        /** 禁用 */
        public static final int DISABLED = 0;
        /** 启用 */
        public static final int ENABLED = 1;
    }
}
