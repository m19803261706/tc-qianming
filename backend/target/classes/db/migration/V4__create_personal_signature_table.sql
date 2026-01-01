-- =====================================================
-- 太初星集电子签章系统 - 个人签名表
-- Version: V4
-- Author: TC System
-- Date: 2026-01-01
-- Description: 创建个人签名表，存储用户的手写签名、上传签名和字体生成签名
-- =====================================================

-- 个人签名表
CREATE TABLE IF NOT EXISTS personal_signature (
    -- 主键ID
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

    -- 用户关联
    user_id BIGINT NOT NULL COMMENT '用户ID',

    -- 签名基本信息
    signature_name VARCHAR(100) COMMENT '签名名称（用于用户识别）',
    signature_image VARCHAR(500) NOT NULL COMMENT '签名图片路径',
    signature_type TINYINT NOT NULL COMMENT '签名类型: 1-上传图片 2-手写签名 3-字体生成',

    -- 字体生成相关
    font_name VARCHAR(50) COMMENT '字体名称（仅字体生成类型）',
    font_color VARCHAR(20) COMMENT '字体颜色（十六进制，如 #000000）',
    text_content VARCHAR(50) COMMENT '签名文本内容（仅字体生成类型）',

    -- 状态信息
    is_default TINYINT DEFAULT 0 COMMENT '是否默认签名: 0-否 1-是',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',

    -- 审计字段
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by VARCHAR(50) COMMENT '创建人',
    update_by VARCHAR(50) COMMENT '更新人',

    -- 索引
    INDEX idx_user (user_id) COMMENT '用户索引',
    INDEX idx_user_default (user_id, is_default) COMMENT '用户默认签名索引',
    INDEX idx_type (signature_type) COMMENT '签名类型索引',
    INDEX idx_status (status) COMMENT '状态索引'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人签名表';
