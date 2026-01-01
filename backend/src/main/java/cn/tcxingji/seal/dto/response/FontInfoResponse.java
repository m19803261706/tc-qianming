package cn.tcxingji.seal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 字体信息响应 DTO
 * <p>
 * 用于返回可用于签名的字体列表
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FontInfoResponse {

    /**
     * 字体名称（系统名称）
     */
    private String fontName;

    /**
     * 字体显示名称（中文名）
     */
    private String displayName;

    /**
     * 字体家族
     */
    private String fontFamily;

    /**
     * 是否推荐用于签名
     */
    private Boolean recommended;

    /**
     * 字体样式描述
     */
    private String description;

    /**
     * 预览图片URL（可选）
     */
    private String previewUrl;
}
