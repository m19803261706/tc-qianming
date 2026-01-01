package cn.tcxingji.seal.dto.response;

import cn.tcxingji.seal.entity.PersonalSignature;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 签名响应 DTO
 * <p>
 * 用于返回个人签名信息
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignatureResponse {

    /**
     * 签名ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 签名名称
     */
    private String signatureName;

    /**
     * 签名图片路径
     */
    private String signatureImage;

    /**
     * 签名图片URL
     */
    private String signatureImageUrl;

    /**
     * 签名类型
     * 1-上传图片 2-手写签名 3-字体生成
     */
    private Integer signatureType;

    /**
     * 签名类型描述
     */
    private String signatureTypeDesc;

    /**
     * 字体名称
     */
    private String fontName;

    /**
     * 字体颜色
     */
    private String fontColor;

    /**
     * 签名文本内容
     */
    private String textContent;

    /**
     * 是否默认签名
     * 0-否 1-是
     */
    private Integer isDefault;

    /**
     * 状态
     * 0-禁用 1-启用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 从实体转换为响应 DTO
     *
     * @param entity 个人签名实体
     * @return 签名响应
     */
    public static SignatureResponse fromEntity(PersonalSignature entity) {
        if (entity == null) {
            return null;
        }
        return SignatureResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .signatureName(entity.getSignatureName())
                .signatureImage(entity.getSignatureImage())
                .signatureType(entity.getSignatureType())
                .signatureTypeDesc(entity.getSignatureTypeDesc())
                .fontName(entity.getFontName())
                .fontColor(entity.getFontColor())
                .textContent(entity.getTextContent())
                .isDefault(entity.getIsDefault())
                .status(entity.getStatus())
                .createTime(entity.getCreateTime())
                .updateTime(entity.getUpdateTime())
                .build();
    }

    /**
     * 从实体转换为响应 DTO（包含图片 URL）
     *
     * @param entity  个人签名实体
     * @param baseUrl 基础URL
     * @return 签名响应
     */
    public static SignatureResponse fromEntity(PersonalSignature entity, String baseUrl) {
        SignatureResponse response = fromEntity(entity);
        if (response != null && response.getSignatureImage() != null) {
            response.setSignatureImageUrl(baseUrl + response.getSignatureImage());
        }
        return response;
    }
}
