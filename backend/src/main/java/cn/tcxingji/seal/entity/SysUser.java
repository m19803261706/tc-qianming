package cn.tcxingji.seal.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 系统用户实体类
 * <p>
 * 存储系统登录用户信息，包括用户名、密码、状态等
 * </p>
 *
 * @author TC System
 * @since 2026-01-03
 */
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sys_user", indexes = {
        @Index(name = "idx_username", columnList = "username"),
        @Index(name = "idx_status", columnList = "status")
})
public class SysUser {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户名（唯一）
     */
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    /**
     * 密码（BCrypt加密）
     */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    /**
     * 昵称/显示名
     */
    @Column(name = "nickname", length = 50)
    private String nickname;

    /**
     * 状态
     * 0-禁用 1-启用
     */
    @Column(name = "status", columnDefinition = "TINYINT")
    @Builder.Default
    private Integer status = 1;

    /**
     * 是否管理员
     * 0-否 1-是
     */
    @Column(name = "is_admin", columnDefinition = "TINYINT")
    @Builder.Default
    private Integer isAdmin = 0;

    /**
     * 创建时间
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 插入前自动设置创建时间
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 更新前自动设置更新时间
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== 枚举常量 ====================

    /**
     * 状态枚举
     */
    public static class Status {
        /** 禁用 */
        public static final int DISABLED = 0;
        /** 启用 */
        public static final int ENABLED = 1;
    }

    /**
     * 是否管理员枚举
     */
    public static class IsAdmin {
        /** 否 */
        public static final int NO = 0;
        /** 是 */
        public static final int YES = 1;
    }

    // ==================== 便捷方法 ====================

    /**
     * 判断用户是否启用
     */
    public boolean isEnabled() {
        return Status.ENABLED == this.status;
    }

    /**
     * 判断是否为管理员
     */
    public boolean isAdminUser() {
        return IsAdmin.YES == this.isAdmin;
    }
}
