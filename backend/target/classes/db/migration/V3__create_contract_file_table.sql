-- =====================================================
-- 太初星集电子签章系统 - 合同文件表
-- Version: V3
-- Author: TC System
-- Date: 2026-01-01
-- Description: 创建合同文件表，存储上传的 PDF 合同文件信息
-- =====================================================

-- 合同文件表
CREATE TABLE IF NOT EXISTS contract_file (
    -- 主键ID
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

    -- 文件基本信息
    file_name VARCHAR(200) NOT NULL COMMENT '文件名（包含扩展名）',
    original_path VARCHAR(500) NOT NULL COMMENT '原始文件路径',
    signed_path VARCHAR(500) COMMENT '签章后文件路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    page_count INT COMMENT 'PDF页数',
    file_hash VARCHAR(64) COMMENT '文件哈希值（SHA-256）',

    -- 状态信息
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待签章 1-签章中 2-已签章 3-已作废',

    -- 所有者信息
    owner_id BIGINT NOT NULL COMMENT '所有者ID',
    owner_type TINYINT DEFAULT 1 COMMENT '所有者类型: 1-企业 2-个人',

    -- 备注信息
    remark VARCHAR(500) COMMENT '备注',

    -- 审计字段
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',

    -- 索引
    INDEX idx_owner (owner_id, owner_type) COMMENT '所有者索引',
    INDEX idx_status (status) COMMENT '状态索引',
    INDEX idx_file_hash (file_hash) COMMENT '文件哈希索引',
    INDEX idx_create_time (create_time) COMMENT '创建时间索引'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同文件表';
