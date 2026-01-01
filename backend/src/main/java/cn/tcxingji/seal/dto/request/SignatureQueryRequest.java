package cn.tcxingji.seal.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 签名查询请求 DTO
 * <p>
 * 用于分页查询个人签名的请求参数
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignatureQueryRequest {

    /**
     * 用户ID（必填）
     */
    private Long userId;

    /**
     * 签名类型（可选）
     * 1-上传图片 2-手写签名 3-字体生成
     */
    private Integer signatureType;

    /**
     * 状态（可选）
     * 0-禁用 1-启用
     */
    private Integer status;

    /**
     * 签名名称关键词（模糊搜索）
     */
    private String keyword;

    /**
     * 页码（从1开始）
     */
    @Builder.Default
    private Integer page = 1;

    /**
     * 每页大小
     */
    @Builder.Default
    private Integer size = 10;

    /**
     * 获取偏移量
     *
     * @return 偏移量
     */
    public int getOffset() {
        return (page - 1) * size;
    }
}
