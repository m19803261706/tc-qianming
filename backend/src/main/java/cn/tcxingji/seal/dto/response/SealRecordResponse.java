package cn.tcxingji.seal.dto.response;

import cn.tcxingji.seal.entity.SealRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 签章记录响应 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SealRecordResponse {

    /**
     * 记录ID
     */
    private Long id;

    /**
     * 合同ID
     */
    private Long contractId;

    /**
     * 印章ID
     */
    private Long sealId;

    /**
     * 盖章页码
     */
    private Integer pageNumber;

    /**
     * X坐标
     */
    private BigDecimal positionX;

    /**
     * Y坐标
     */
    private BigDecimal positionY;

    /**
     * 印章宽度
     */
    private BigDecimal sealWidth;

    /**
     * 印章高度
     */
    private BigDecimal sealHeight;

    /**
     * 签章类型
     */
    private Integer sealType;

    /**
     * 签章类型描述
     */
    private String sealTypeText;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 操作人姓名
     */
    private String operatorName;

    /**
     * 签章时间
     */
    private LocalDateTime sealTime;

    /**
     * 从实体转换
     */
    public static SealRecordResponse fromEntity(SealRecord entity) {
        return SealRecordResponse.builder()
                .id(entity.getId())
                .contractId(entity.getContractId())
                .sealId(entity.getSealId())
                .pageNumber(entity.getPageNumber())
                .positionX(entity.getPositionX())
                .positionY(entity.getPositionY())
                .sealWidth(entity.getSealWidth())
                .sealHeight(entity.getSealHeight())
                .sealType(entity.getSealType())
                .sealTypeText(getSealTypeText(entity.getSealType()))
                .operatorId(entity.getOperatorId())
                .operatorName(entity.getOperatorName())
                .sealTime(entity.getSealTime())
                .build();
    }

    /**
     * 获取签章类型描述
     */
    private static String getSealTypeText(Integer sealType) {
        if (sealType == null) {
            return "未知";
        }
        return switch (sealType) {
            case 1 -> "普通章";
            case 2 -> "骑缝章";
            case 3 -> "个人签名";
            default -> "未知";
        };
    }
}
