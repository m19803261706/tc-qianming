package cn.tcxingji.seal.dto.request;

import lombok.Data;

/**
 * 印章查询请求 DTO
 * <p>
 * 用于接收查询印章列表的请求参数，支持分页和筛选
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Data
public class SealQueryRequest {

    /**
     * 印章名称（模糊查询）
     */
    private String sealName;

    /**
     * 印章类型
     * 1-企业公章 2-合同专用章 3-财务章 4-个人签名
     */
    private Integer sealType;

    /**
     * 所有者ID
     */
    private Long ownerId;

    /**
     * 所有者类型
     * 1-企业 2-个人
     */
    private Integer ownerType;

    /**
     * 状态
     * 0-禁用 1-启用
     */
    private Integer status;

    /**
     * 页码（从0开始）
     */
    private Integer page = 0;

    /**
     * 每页大小
     */
    private Integer size = 10;
}
