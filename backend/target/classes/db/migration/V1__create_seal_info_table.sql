-- =====================================================
-- 太初星集电子签章系统 - 印章信息表
-- Version: V1
-- Author: TC System
-- Date: 2026-01-01
-- Description: 创建印章信息表，存储企业公章、合同专用章、财务章、个人签名章等印章数据
-- =====================================================

-- 印章信息表
CREATE TABLE IF NOT EXISTS seal_info (
    -- 主键ID
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

    -- 印章基本信息
    seal_name VARCHAR(100) NOT NULL COMMENT '印章名称',
    seal_type TINYINT NOT NULL COMMENT '印章类型: 1-企业公章 2-合同专用章 3-财务章 4-个人签名',
    seal_image VARCHAR(500) NOT NULL COMMENT '印章图片路径',
    seal_source TINYINT NOT NULL COMMENT '印章来源: 1-上传 2-系统生成 3-模板',

    -- 所有者信息
    owner_id BIGINT NOT NULL COMMENT '所有者ID',
    owner_type TINYINT NOT NULL COMMENT '所有者类型: 1-企业 2-个人',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',

    -- 审计字段
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',

    -- 索引
    INDEX idx_owner (owner_id, owner_type) COMMENT '所有者索引',
    INDEX idx_type (seal_type) COMMENT '印章类型索引',
    INDEX idx_status (status) COMMENT '状态索引'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='印章信息表';
