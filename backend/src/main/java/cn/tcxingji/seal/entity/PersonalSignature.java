package cn.tcxingji.seal.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 个人签名实体类
 * <p>
 * 存储用户的手写签名、上传签名和字体生成签名
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
@Table(name = "personal_signature", indexes = {
        @Index(name = "idx_user", columnList = "user_id"),
        @Index(name = "idx_user_default", columnList = "user_id, is_default"),
        @Index(name = "idx_type", columnList = "signature_type"),
        @Index(name = "idx_status", columnList = "status")
})
public class PersonalSignature {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 签名名称（用于用户识别）
     */
    @Column(name = "signature_name", length = 100)
    private String signatureName;

    /**
     * 签名图片路径
     */
    @Column(name = "signature_image", nullable = false, length = 500)
    private String signatureImage;

    /**
     * 签名类型
     * 1-上传图片 2-手写签名 3-字体生成
     */
    @Column(name = "signature_type", nullable = false, columnDefinition = "TINYINT")
    private Integer signatureType;

    /**
     * 字体名称（仅字体生成类型）
     */
    @Column(name = "font_name", length = 50)
    private String fontName;

    /**
     * 字体颜色（十六进制，如 #000000）
     */
    @Column(name = "font_color", length = 20)
    private String fontColor;

    /**
     * 签名文本内容（仅字体生成类型）
     */
    @Column(name = "text_content", length = 50)
    private String textContent;

    /**
     * 签名图片宽度（像素）
     * 用于前端精确显示和坐标计算
     */
    @Column(name = "image_width")
    private Integer imageWidth;

    /**
     * 签名图片高度（像素）
     * 用于前端精确显示和坐标计算
     */
    @Column(name = "image_height")
    private Integer imageHeight;

    /**
     * 是否默认签名
     * 0-否 1-是
     */
    @Column(name = "is_default", columnDefinition = "TINYINT")
    @Builder.Default
    private Integer isDefault = 0;

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
     * 签名类型枚举
     */
    public static class SignatureType {
        /** 上传图片 - 用户上传现有签名图片 */
        public static final int UPLOAD = 1;
        /** 手写签名 - 用户通过手写板实时绘制 */
        public static final int HANDWRITING = 2;
        /** 字体生成 - 使用特定字体自动生成签名 */
        public static final int FONT_GENERATED = 3;
    }

    /**
     * 默认签名枚举
     */
    public static class DefaultFlag {
        /** 非默认 */
        public static final int NO = 0;
        /** 默认签名 */
        public static final int YES = 1;
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

    // ==================== 业务方法 ====================

    /**
     * 判断是否为默认签名
     *
     * @return 是否为默认签名
     */
    public boolean isDefaultSignature() {
        return this.isDefault != null && this.isDefault == DefaultFlag.YES;
    }

    /**
     * 判断是否已启用
     *
     * @return 是否已启用
     */
    public boolean isEnabled() {
        return this.status != null && this.status == Status.ENABLED;
    }

    /**
     * 判断是否为手写签名
     *
     * @return 是否为手写签名
     */
    public boolean isHandwriting() {
        return this.signatureType != null && this.signatureType == SignatureType.HANDWRITING;
    }

    /**
     * 判断是否为字体生成签名
     *
     * @return 是否为字体生成签名
     */
    public boolean isFontGenerated() {
        return this.signatureType != null && this.signatureType == SignatureType.FONT_GENERATED;
    }

    /**
     * 获取签名类型描述
     *
     * @return 签名类型描述
     */
    public String getSignatureTypeDesc() {
        if (this.signatureType == null) {
            return "未知";
        }
        return switch (this.signatureType) {
            case SignatureType.UPLOAD -> "上传图片";
            case SignatureType.HANDWRITING -> "手写签名";
            case SignatureType.FONT_GENERATED -> "字体生成";
            default -> "未知";
        };
    }
}
