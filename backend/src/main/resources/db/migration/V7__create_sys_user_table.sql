-- =============================================
-- 系统用户表 (sys_user)
-- 用途: 存储系统登录用户信息
-- 创建时间: 2026-01-03
-- =============================================

-- 创建用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    nickname VARCHAR(50) COMMENT '昵称/显示名',
    status TINYINT DEFAULT 1 COMMENT '状态: 1启用 0禁用',
    is_admin TINYINT DEFAULT 0 COMMENT '是否管理员: 1是 0否',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

-- 插入默认管理员账号
-- 用户名: taichu
-- 密码: tcxj888 (BCrypt加密后存储)
INSERT INTO sys_user (username, password, nickname, status, is_admin)
VALUES (
    'taichu',
    '$2b$10$wLjorGuxbnh6qLQHrHb3b.Zbx4DC1kunJSF7eZcNBZT2Q8aTP6bou',
    '太初管理员',
    1,
    1
);
