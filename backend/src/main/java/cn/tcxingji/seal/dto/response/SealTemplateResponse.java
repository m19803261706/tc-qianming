package cn.tcxingji.seal.dto.response;

import cn.tcxingji.seal.enums.SealTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 印章模板响应 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SealTemplateResponse {

    /**
     * 模板代码
     */
    private String code;

    /**
     * 模板名称
     */
    private String name;

    /**
     * 基础尺寸
     */
    private int baseSize;

    /**
     * 是否包含五角星
     */
    private boolean hasStar;

    /**
     * 默认字体
     */
    private String fontName;

    /**
     * 从枚举创建响应
     *
     * @param template 模板枚举
     * @return 响应 DTO
     */
    public static SealTemplateResponse fromEnum(SealTemplate template) {
        return SealTemplateResponse.builder()
                .code(template.getCode())
                .name(template.getName())
                .baseSize(template.getBaseSize())
                .hasStar(template.isHasStar())
                .fontName(template.getFontName())
                .build();
    }
}
