package cn.tcxingji.seal.dto.response;

import cn.tcxingji.seal.entity.SealInfo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 印章响应 DTO
 * <p>
 * 用于返回印章信息给前端
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
public class SealResponse {

    /**
     * 印章ID
     */
    private Long id;

    /**
     * 印章名称
     */
    private String sealName;

    /**
     * 印章类型
     */
    private Integer sealType;

    /**
     * 印章类型描述
     */
    private String sealTypeDesc;

    /**
     * 印章图片路径
     */
    private String sealImage;

    /**
     * 印章来源
     */
    private Integer sealSource;

    /**
     * 印章来源描述
     */
    private String sealSourceDesc;

    /**
     * 所有者ID
     */
    private Long ownerId;

    /**
     * 所有者类型
     */
    private Integer ownerType;

    /**
     * 所有者类型描述
     */
    private String ownerTypeDesc;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusDesc;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 创建人
     */
    private String createBy;

    /**
     * 从实体转换为响应 DTO
     *
     * @param sealInfo 印章实体
     * @return 印章响应 DTO
     */
    public static SealResponse fromEntity(SealInfo sealInfo) {
        if (sealInfo == null) {
            return null;
        }
        return SealResponse.builder()
                .id(sealInfo.getId())
                .sealName(sealInfo.getSealName())
                .sealType(sealInfo.getSealType())
                .sealTypeDesc(getSealTypeDesc(sealInfo.getSealType()))
                .sealImage(sealInfo.getSealImage())
                .sealSource(sealInfo.getSealSource())
                .sealSourceDesc(getSealSourceDesc(sealInfo.getSealSource()))
                .ownerId(sealInfo.getOwnerId())
                .ownerType(sealInfo.getOwnerType())
                .ownerTypeDesc(getOwnerTypeDesc(sealInfo.getOwnerType()))
                .status(sealInfo.getStatus())
                .statusDesc(getStatusDesc(sealInfo.getStatus()))
                .createTime(sealInfo.getCreateTime())
                .updateTime(sealInfo.getUpdateTime())
                .createBy(sealInfo.getCreateBy())
                .build();
    }

    /**
     * 获取印章类型描述
     */
    private static String getSealTypeDesc(Integer sealType) {
        if (sealType == null) return "未知";
        return switch (sealType) {
            case SealInfo.SealType.COMPANY_SEAL -> "企业公章";
            case SealInfo.SealType.CONTRACT_SEAL -> "合同专用章";
            case SealInfo.SealType.FINANCE_SEAL -> "财务章";
            case SealInfo.SealType.PERSONAL_SIGNATURE -> "个人签名";
            default -> "未知";
        };
    }

    /**
     * 获取印章来源描述
     */
    private static String getSealSourceDesc(Integer sealSource) {
        if (sealSource == null) return "未知";
        return switch (sealSource) {
            case SealInfo.SealSource.UPLOAD -> "上传";
            case SealInfo.SealSource.GENERATED -> "系统生成";
            case SealInfo.SealSource.TEMPLATE -> "模板";
            default -> "未知";
        };
    }

    /**
     * 获取所有者类型描述
     */
    private static String getOwnerTypeDesc(Integer ownerType) {
        if (ownerType == null) return "未知";
        return switch (ownerType) {
            case SealInfo.OwnerType.ENTERPRISE -> "企业";
            case SealInfo.OwnerType.PERSONAL -> "个人";
            default -> "未知";
        };
    }

    /**
     * 获取状态描述
     */
    private static String getStatusDesc(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case SealInfo.Status.DISABLED -> "禁用";
            case SealInfo.Status.ENABLED -> "启用";
            default -> "未知";
        };
    }
}
