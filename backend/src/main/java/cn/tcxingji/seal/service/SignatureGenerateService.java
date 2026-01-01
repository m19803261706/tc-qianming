package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.request.FontSignatureRequest;
import cn.tcxingji.seal.dto.request.HandwriteSignatureRequest;
import cn.tcxingji.seal.dto.response.FontInfoResponse;
import cn.tcxingji.seal.dto.response.SignatureResponse;

import java.util.List;

/**
 * 签名生成服务接口
 * <p>
 * 提供手写签名保存和字体签名生成功能
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
public interface SignatureGenerateService {

    /**
     * 保存手写签名
     * <p>
     * 将 Base64 编码的手写签名图片保存为文件，
     * 并创建签名记录
     * </p>
     *
     * @param request 手写签名请求
     * @return 签名响应
     */
    SignatureResponse saveHandwriteSignature(HandwriteSignatureRequest request);

    /**
     * 生成字体签名
     * <p>
     * 使用指定字体将文本渲染为签名图片，
     * 并创建签名记录
     * </p>
     *
     * @param request 字体签名请求
     * @return 签名响应
     */
    SignatureResponse generateFontSignature(FontSignatureRequest request);

    /**
     * 获取可用字体列表
     * <p>
     * 返回系统中可用于签名生成的中文书法字体
     * </p>
     *
     * @return 字体信息列表
     */
    List<FontInfoResponse> getAvailableFonts();
}
