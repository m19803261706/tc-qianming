package cn.tcxingji.seal.enums;

import lombok.Getter;

/**
 * 印章模板枚举
 * <p>
 * 定义不同类型的印章模板样式
 * </p>
 *
 * @author TC System
 */
@Getter
public enum SealTemplate {

    /**
     * 标准圆形公章
     * 带五角星，企业名称环绕
     */
    STANDARD_CIRCLE(
            "standard_circle",
            "标准圆形公章",
            150,  // 半径
            true, // 带五角星
            true, // 带边框
            2,    // 边框宽度
            "宋体"
    ),

    /**
     * 椭圆形财务章
     * 无五角星，适合财务专用章
     */
    OVAL_FINANCE(
            "oval_finance",
            "椭圆形财务章",
            120,
            false,
            true,
            2,
            "宋体"
    ),

    /**
     * 方形法人章
     * 方形印章，适合法人代表
     */
    SQUARE_LEGAL(
            "square_legal",
            "方形法人章",
            80,
            false,
            true,
            2,
            "篆体"
    );

    /**
     * 模板代码
     */
    private final String code;

    /**
     * 模板名称
     */
    private final String name;

    /**
     * 基础尺寸（半径或边长）
     */
    private final int baseSize;

    /**
     * 是否包含五角星
     */
    private final boolean hasStar;

    /**
     * 是否包含边框
     */
    private final boolean hasBorder;

    /**
     * 边框宽度
     */
    private final int borderWidth;

    /**
     * 默认字体
     */
    private final String fontName;

    SealTemplate(String code, String name, int baseSize, boolean hasStar,
                 boolean hasBorder, int borderWidth, String fontName) {
        this.code = code;
        this.name = name;
        this.baseSize = baseSize;
        this.hasStar = hasStar;
        this.hasBorder = hasBorder;
        this.borderWidth = borderWidth;
        this.fontName = fontName;
    }

    /**
     * 根据代码获取模板
     *
     * @param code 模板代码
     * @return 模板枚举，未找到返回 null
     */
    public static SealTemplate fromCode(String code) {
        for (SealTemplate template : values()) {
            if (template.getCode().equals(code)) {
                return template;
            }
        }
        return null;
    }
}
