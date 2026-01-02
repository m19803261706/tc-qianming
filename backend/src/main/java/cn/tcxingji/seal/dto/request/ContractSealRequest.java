package cn.tcxingji.seal.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 合同盖章请求 DTO
 * <p>
 * 支持两种盖章模式：
 * 1. 印章盖章：使用 sealId 指定印章（sealType=1 或 2）
 * 2. 个人签名：使用 signatureId 指定签名（sealType=3）
 * </p>
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractSealRequest {

    /**
     * 印章ID（sealType=1,2 时必填）
     * <p>
     * 当 sealType 为普通章(1)或骑缝章(2)时需要提供
     * </p>
     */
    private Long sealId;

    /**
     * 个人签名ID（sealType=3 时必填）
     * <p>
     * 当 sealType 为个人签名(3)时需要提供
     * </p>
     */
    private Long signatureId;

    /**
     * 盖章位置列表
     */
    @NotEmpty(message = "盖章位置不能为空")
    @Valid
    private List<SealPositionRequest> positions;

    /**
     * 操作人ID
     */
    @NotNull(message = "操作人ID不能为空")
    private Long operatorId;

    /**
     * 操作人姓名
     */
    private String operatorName;

    /**
     * 签章类型（1-普通章 2-骑缝章 3-个人签名）
     */
    @Builder.Default
    private Integer sealType = 1;
}
