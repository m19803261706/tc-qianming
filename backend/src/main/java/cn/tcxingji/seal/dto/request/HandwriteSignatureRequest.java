package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 手写签名保存请求 DTO
 * <p>
 * 用于保存用户通过手写板绘制的签名
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandwriteSignatureRequest {

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 签名图片 Base64 数据
     * <p>
     * 支持格式：data:image/png;base64,xxx 或纯 Base64 字符串
     * </p>
     */
    @NotBlank(message = "签名图片数据不能为空")
    private String imageData;

    /**
     * 签名名称（用户自定义）
     */
    private String name;

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
