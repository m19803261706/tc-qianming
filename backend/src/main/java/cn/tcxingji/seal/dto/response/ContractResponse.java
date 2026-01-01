package cn.tcxingji.seal.dto.response;

import cn.tcxingji.seal.entity.ContractFile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 合同响应 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {

    /**
     * 合同ID
     */
    private Long id;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 原始文件URL
     */
    private String originalUrl;

    /**
     * 签章后文件URL
     */
    private String signedUrl;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件大小（可读格式）
     */
    private String fileSizeReadable;

    /**
     * PDF页数
     */
    private Integer pageCount;

    /**
     * 文件哈希值
     */
    private String fileHash;

    /**
     * 状态（0-待签章 1-签章中 2-已签章 3-已作废）
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusText;

    /**
     * 所有者ID
     */
    private Long ownerId;

    /**
     * 所有者类型
     */
    private Integer ownerType;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 从实体转换
     *
     * @param entity 合同文件实体
     * @return 响应 DTO
     */
    public static ContractResponse fromEntity(ContractFile entity) {
        return ContractResponse.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .originalUrl("/uploads/contracts/" + extractRelativePath(entity.getOriginalPath()))
                .signedUrl(entity.getSignedPath() != null ?
                        "/uploads/contracts/" + extractRelativePath(entity.getSignedPath()) : null)
                .fileSize(entity.getFileSize())
                .fileSizeReadable(entity.getFileSizeReadable())
                .pageCount(entity.getPageCount())
                .fileHash(entity.getFileHash())
                .status(entity.getStatus())
                .statusText(getStatusText(entity.getStatus()))
                .ownerId(entity.getOwnerId())
                .ownerType(entity.getOwnerType())
                .remark(entity.getRemark())
                .createTime(entity.getCreateTime())
                .updateTime(entity.getUpdateTime())
                .build();
    }

    /**
     * 提取相对路径
     */
    private static String extractRelativePath(String fullPath) {
        if (fullPath == null) {
            return null;
        }
        // 查找 contracts 目录之后的部分
        int idx = fullPath.indexOf("contracts");
        if (idx >= 0) {
            String afterContracts = fullPath.substring(idx + "contracts".length());
            return afterContracts.startsWith("/") || afterContracts.startsWith("\\")
                    ? afterContracts.substring(1)
                    : afterContracts;
        }
        return fullPath;
    }

    /**
     * 获取状态描述
     */
    private static String getStatusText(Integer status) {
        if (status == null) {
            return "未知";
        }
        return switch (status) {
            case 0 -> "待签章";
            case 1 -> "签章中";
            case 2 -> "已签章";
            case 3 -> "已作废";
            default -> "未知";
        };
    }
}
