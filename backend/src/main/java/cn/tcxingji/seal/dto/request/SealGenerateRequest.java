package cn.tcxingji.seal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 印章生成请求 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SealGenerateRequest {

    /**
     * 企业/组织名称（环绕显示）
     */
    @NotBlank(message = "企业名称不能为空")
    @Size(max = 30, message = "企业名称最多30个字符")
    private String companyName;

    /**
     * 中心文字（如：合同专用章）
     */
    @Size(max = 10, message = "中心文字最多10个字符")
    private String centerText;

    /**
     * 模板代码
     * @see cn.tcxingji.seal.enums.SealTemplate
     */
    private String templateCode;

    /**
     * 印章颜色（默认红色）
     */
    private String color;

    /**
     * 自定义尺寸（可选，覆盖模板默认值）
     */
    private Integer size;
}
