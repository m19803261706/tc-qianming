package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 印章创建请求 DTO
 * <p>
 * 用于接收创建印章的请求参数
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
public class SealCreateRequest {

    /**
     * 印章名称
     */
    @NotBlank(message = "印章名称不能为空")
    @Size(max = 100, message = "印章名称不能超过100个字符")
    private String sealName;

    /**
     * 印章类型
     * 1-企业公章 2-合同专用章 3-财务章 4-个人签名
     */
    @NotNull(message = "印章类型不能为空")
    private Integer sealType;

    /**
     * 印章图片路径
     */
    @NotBlank(message = "印章图片不能为空")
    @Size(max = 500, message = "印章图片路径不能超过500个字符")
    private String sealImage;

    /**
     * 印章来源
     * 1-上传 2-系统生成 3-模板
     */
    @NotNull(message = "印章来源不能为空")
    private Integer sealSource;

    /**
     * 所有者ID
     */
    @NotNull(message = "所有者ID不能为空")
    private Long ownerId;

    /**
     * 所有者类型
     * 1-企业 2-个人
     */
    @NotNull(message = "所有者类型不能为空")
    private Integer ownerType;
}
