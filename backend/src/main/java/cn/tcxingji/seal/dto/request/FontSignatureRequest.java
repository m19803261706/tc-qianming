package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 字体签名生成请求 DTO
 * <p>
 * 用于根据字体生成个人签名
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FontSignatureRequest {

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 签名文本内容
     * <p>
     * 通常是用户姓名
     * </p>
     */
    @NotBlank(message = "签名文本不能为空")
    private String text;

    /**
     * 字体名称
     * <p>
     * 如：华文行楷、华文新魏、楷体 等
     * </p>
     */
    @NotBlank(message = "字体名称不能为空")
    private String fontName;

    /**
     * 字体颜色（十六进制）
     * <p>
     * 默认黑色 #000000
     * </p>
     */
    @Builder.Default
    private String fontColor = "#000000";

    /**
     * 字体大小（可选，默认48）
     */
    @Builder.Default
    private Integer fontSize = 48;

    /**
     * 签名名称（用户自定义，可选）
     */
    private String signatureName;

    /**
     * 是否设为默认签名
     */
    @Builder.Default
    private Boolean setDefault = false;

    /**
     * 创建人
     */
    private String createBy;
}
