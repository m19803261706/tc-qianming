package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 骑缝章请求 DTO
 * <p>
 * 骑缝章会将印章按页数分割，每页显示一部分，合并后形成完整印章
 * </p>
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerforationSealRequest {

    /**
     * 印章ID
     */
    @NotNull(message = "印章ID不能为空")
    private Long sealId;

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
     * Y坐标偏移（可选，默认居中）
     * <p>
     * 正值向上偏移，负值向下偏移
     * </p>
     */
    @Builder.Default
    private BigDecimal yOffset = BigDecimal.ZERO;

    /**
     * 印章宽度（可选，默认120）
     * <p>
     * 印章在页面边缘显示的宽度
     * </p>
     */
    @Builder.Default
    private BigDecimal sealWidth = new BigDecimal("120");

    /**
     * 印章总高度（可选，默认120）
     * <p>
     * 印章在所有页面合并后的总高度
     * </p>
     */
    @Builder.Default
    private BigDecimal sealHeight = new BigDecimal("120");

    /**
     * 边缘留白（可选，默认印章宽度的一半，使印章一半在页面内）
     */
    private BigDecimal edgeMargin;
}
