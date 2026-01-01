package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 印章位置请求 DTO
 * <p>
 * 定义印章在 PDF 页面上的位置和大小
 * </p>
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SealPositionRequest {

    /**
     * 页码（从1开始）
     */
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码必须大于0")
    private Integer pageNumber;

    /**
     * X坐标（距左边距离，单位：pt/点）
     */
    @NotNull(message = "X坐标不能为空")
    private BigDecimal x;

    /**
     * Y坐标（距下边距离，单位：pt/点，PDF坐标系原点在左下角）
     */
    @NotNull(message = "Y坐标不能为空")
    private BigDecimal y;

    /**
     * 印章宽度（可选，默认使用原始尺寸）
     */
    @Builder.Default
    private BigDecimal width = new BigDecimal("120");

    /**
     * 印章高度（可选，默认使用原始尺寸）
     */
    @Builder.Default
    private BigDecimal height = new BigDecimal("120");
}
