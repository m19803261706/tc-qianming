package cn.tcxingji.seal.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 合同查询请求 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractQueryRequest {

    /**
     * 所有者ID
     */
    private Long ownerId;

    /**
     * 所有者类型（1-企业 2-个人）
     */
    private Integer ownerType;

    /**
     * 状态（0-待签章 1-签章中 2-已签章 3-已作废）
     */
    private Integer status;

    /**
     * 文件名关键词（已废弃，请使用 keyword）
     */
    @Deprecated
    private String fileName;

    /**
     * 搜索关键词（匹配合同名称或文件名）
     */
    private String keyword;

    /**
     * 页码（从1开始）
     */
    @Builder.Default
    private Integer page = 1;

    /**
     * 每页数量
     */
    @Builder.Default
    private Integer size = 10;
}
