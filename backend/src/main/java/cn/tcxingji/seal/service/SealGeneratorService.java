package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.request.SealGenerateRequest;
import cn.tcxingji.seal.dto.response.FileUploadResponse;
import cn.tcxingji.seal.enums.SealTemplate;

import java.util.List;

/**
 * 印章生成服务接口
 *
 * @author TC System
 */
public interface SealGeneratorService {

    /**
     * 根据请求生成印章图片
     *
     * @param request 生成请求
     * @return 文件上传响应（包含图片路径）
     */
    FileUploadResponse generateSeal(SealGenerateRequest request);

    /**
     * 获取所有可用的印章模板
     *
     * @return 模板列表
     */
    List<SealTemplate> getTemplates();
}
