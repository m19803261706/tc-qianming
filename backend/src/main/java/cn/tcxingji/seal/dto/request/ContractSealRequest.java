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
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractSealRequest {

    /**
     * 印章ID
     */
    @NotNull(message = "印章ID不能为空")
    private Long sealId;

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
