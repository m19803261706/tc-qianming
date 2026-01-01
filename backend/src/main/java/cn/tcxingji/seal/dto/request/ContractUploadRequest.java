package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 合同上传请求 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractUploadRequest {

    /**
     * 所有者ID
     */
    @NotNull(message = "所有者ID不能为空")
    private Long ownerId;

    /**
     * 所有者类型（1-企业 2-个人）
     */
    @Builder.Default
    private Integer ownerType = 1;

    /**
     * 备注
     */
    private String remark;
}
