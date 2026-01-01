package cn.tcxingji.seal.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 合同文件实体类
 * <p>
 * 存储上传的 PDF 合同文件信息，包括文件路径、大小、页数、签章状态等
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
@Table(name = "contract_file", indexes = {
        @Index(name = "idx_owner", columnList = "owner_id, owner_type"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_file_hash", columnList = "file_hash"),
        @Index(name = "idx_create_time", columnList = "create_time")
})
public class ContractFile {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 文件名（包含扩展名）
     */
    @Column(name = "file_name", nullable = false, length = 200)
    private String fileName;

    /**
     * 原始文件路径
     */
    @Column(name = "original_path", nullable = false, length = 500)
    private String originalPath;

    /**
     * 签章后文件路径
     */
    @Column(name = "signed_path", length = 500)
    private String signedPath;

    /**
     * 文件大小（字节）
     */
    @Column(name = "file_size")
    private Long fileSize;

    /**
     * PDF页数
     */
    @Column(name = "page_count")
    private Integer pageCount;

    /**
     * 文件哈希值（SHA-256）
     */
    @Column(name = "file_hash", length = 64)
    private String fileHash;

    /**
     * 状态
     * 0-待签章 1-签章中 2-已签章 3-已作废
     */
    @Column(name = "status", columnDefinition = "TINYINT")
    @Builder.Default
    private Integer status = 0;

    /**
     * 所有者ID
     */
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    /**
     * 所有者类型
     * 1-企业 2-个人
     */
    @Column(name = "owner_type", columnDefinition = "TINYINT")
    @Builder.Default
    private Integer ownerType = 1;

    /**
     * 备注
     */
    @Column(name = "remark", length = 500)
    private String remark;

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
     * 合同状态枚举
     */
    public static class Status {
        /** 待签章 */
        public static final int PENDING = 0;
        /** 签章中 */
        public static final int SIGNING = 1;
        /** 已签章 */
        public static final int SIGNED = 2;
        /** 已作废 */
        public static final int CANCELLED = 3;
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

    // ==================== 业务方法 ====================

    /**
     * 判断是否可以进行签章
     *
     * @return 是否可签章
     */
    public boolean canSign() {
        return this.status != null && this.status == Status.PENDING;
    }

    /**
     * 判断是否已完成签章
     *
     * @return 是否已签章
     */
    public boolean isSigned() {
        return this.status != null && this.status == Status.SIGNED;
    }

    /**
     * 获取文件大小的可读格式
     *
     * @return 格式化后的文件大小（如 1.5 MB）
     */
    public String getFileSizeReadable() {
        if (this.fileSize == null) {
            return "未知";
        }
        if (this.fileSize < 1024) {
            return this.fileSize + " B";
        } else if (this.fileSize < 1024 * 1024) {
            return String.format("%.2f KB", this.fileSize / 1024.0);
        } else if (this.fileSize < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", this.fileSize / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", this.fileSize / (1024.0 * 1024 * 1024));
        }
    }
}
