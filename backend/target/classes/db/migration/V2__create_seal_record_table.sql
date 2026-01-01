-- =====================================================
-- 太初星集电子签章系统 - 签章记录表
-- Version: V2
-- Author: TC System
-- Date: 2026-01-01
-- Description: 创建签章记录表，记录每次签章操作的详细信息
-- =====================================================

-- 签章记录表
CREATE TABLE IF NOT EXISTS seal_record (
    -- 主键ID
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

    -- 关联信息
    contract_id BIGINT NOT NULL COMMENT '合同文件ID',
    seal_id BIGINT NOT NULL COMMENT '印章ID',

    -- 盖章位置信息
    page_number INT NOT NULL COMMENT '盖章页码',
    position_x DECIMAL(10,2) NOT NULL COMMENT 'X坐标（距左边距离）',
    position_y DECIMAL(10,2) NOT NULL COMMENT 'Y坐标（距上边距离）',
    seal_width DECIMAL(10,2) COMMENT '印章宽度（像素）',
    seal_height DECIMAL(10,2) COMMENT '印章高度（像素）',

    -- 签章类型
    seal_type TINYINT NOT NULL COMMENT '签章类型: 1-普通章 2-骑缝章 3-个人签名',

    -- 操作人信息
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',

    -- 时间信息
    seal_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '签章时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_contract (contract_id) COMMENT '合同ID索引',
    INDEX idx_seal (seal_id) COMMENT '印章ID索引',
    INDEX idx_operator (operator_id) COMMENT '操作人索引',
    INDEX idx_seal_time (seal_time) COMMENT '签章时间索引'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签章记录表';
