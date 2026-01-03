-- 添加签名图片尺寸字段
-- 用于前端精确显示和坐标计算，解决签名位置偏移问题

ALTER TABLE personal_signature
    ADD COLUMN image_width INT COMMENT '签名图片宽度（像素）' AFTER text_content,
    ADD COLUMN image_height INT COMMENT '签名图片高度（像素）' AFTER image_width;
