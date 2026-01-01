package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 签名创建请求 DTO
 * <p>
 * 用于创建个人签名的请求参数
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignatureCreateRequest {

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 签名名称（用于用户识别）
     */
    private String signatureName;

    /**
     * 签名图片路径
     */
    @NotBlank(message = "签名图片不能为空")
    private String signatureImage;

    /**
     * 签名类型
     * 1-上传图片 2-手写签名 3-字体生成
     */
    @NotNull(message = "签名类型不能为空")
    private Integer signatureType;

    /**
     * 字体名称（仅字体生成类型需要）
     */
    private String fontName;

    /**
     * 字体颜色（十六进制，如 #000000）
     */
    private String fontColor;

    /**
     * 签名文本内容（仅字体生成类型需要）
     */
    private String textContent;

    /**
     * 是否设为默认签名
     * 0-否 1-是
     */
    @Builder.Default
    private Integer isDefault = 0;

    /**
     * 创建人
     */
    private String createBy;
}
