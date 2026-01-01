package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 印章更新请求 DTO
 * <p>
 * 用于接收更新印章的请求参数，所有字段可选
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
public class SealUpdateRequest {

    /**
     * 印章名称
     */
    @Size(max = 100, message = "印章名称不能超过100个字符")
    private String sealName;

    /**
     * 印章类型
     * 1-企业公章 2-合同专用章 3-财务章 4-个人签名
     */
    private Integer sealType;

    /**
     * 印章图片路径
     */
    @Size(max = 500, message = "印章图片路径不能超过500个字符")
    private String sealImage;

    /**
     * 印章来源
     * 1-上传 2-系统生成 3-模板
     */
    private Integer sealSource;
}
