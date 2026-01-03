-- =====================================================
-- V5: 添加合同名称字段
-- 功能: 允许用户自定义合同显示名称
-- 作者: TC System
-- 日期: 2026-01-02
-- =====================================================

-- 添加 contract_name 字段
ALTER TABLE contract_file
    ADD COLUMN contract_name VARCHAR(200) COMMENT '合同名称（用户自定义的显示名称）' AFTER id;

-- 将现有记录的 contract_name 设置为 file_name（去掉 .pdf 扩展名）
UPDATE contract_file
SET contract_name = CASE
    WHEN LOWER(file_name) LIKE '%.pdf'
    THEN SUBSTRING(file_name, 1, LENGTH(file_name) - 4)
    ELSE file_name
END
WHERE contract_name IS NULL;
