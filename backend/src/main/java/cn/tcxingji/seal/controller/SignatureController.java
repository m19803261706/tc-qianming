package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.request.FontSignatureRequest;
import cn.tcxingji.seal.dto.request.HandwriteSignatureRequest;
import cn.tcxingji.seal.dto.request.SignatureCreateRequest;
import cn.tcxingji.seal.dto.request.SignatureQueryRequest;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.FontInfoResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SignatureResponse;
import cn.tcxingji.seal.service.SignatureGenerateService;
import cn.tcxingji.seal.service.SignatureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 个人签名管理控制器
 * <p>
 * 提供个人签名的增删改查 REST API 接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Slf4j
@RestController
@RequestMapping("/api/signatures")
@RequiredArgsConstructor
public class SignatureController {

    private final SignatureService signatureService;
    private final SignatureGenerateService signatureGenerateService;

    /**
     * 获取签名列表（分页）
     *
     * @param request 查询请求
     * @return 分页响应
     */
    @GetMapping
    public ApiResponse<PageResponse<SignatureResponse>> queryPage(SignatureQueryRequest request) {
        log.debug("分页查询签名: userId={}, page={}, size={}",
                request.getUserId(), request.getPage(), request.getSize());
        PageResponse<SignatureResponse> response = signatureService.queryPage(request);
        return ApiResponse.success(response);
    }

    /**
     * 获取用户的所有签名
     *
     * @param userId 用户ID
     * @return 签名列表
     */
    @GetMapping("/user/{userId}")
    public ApiResponse<List<SignatureResponse>> listByUserId(@PathVariable Long userId) {
        log.debug("获取用户签名列表: userId={}", userId);
        List<SignatureResponse> response = signatureService.listByUserId(userId);
        return ApiResponse.success(response);
    }

    /**
     * 获取用户的启用签名
     *
     * @param userId 用户ID
     * @return 签名列表
     */
    @GetMapping("/user/{userId}/enabled")
    public ApiResponse<List<SignatureResponse>> listEnabledByUserId(@PathVariable Long userId) {
        log.debug("获取用户启用签名列表: userId={}", userId);
        List<SignatureResponse> response = signatureService.listEnabledByUserId(userId);
        return ApiResponse.success(response);
    }

    /**
     * 获取用户的默认签名
     *
     * @param userId 用户ID
     * @return 默认签名（可能为 null）
     */
    @GetMapping("/user/{userId}/default")
    public ApiResponse<SignatureResponse> getDefaultByUserId(@PathVariable Long userId) {
        log.debug("获取用户默认签名: userId={}", userId);
        SignatureResponse response = signatureService.getDefaultByUserId(userId);
        if (response == null) {
            return ApiResponse.success("用户暂无默认签名", null);
        }
        return ApiResponse.success(response);
    }

    /**
     * 获取签名详情
     *
     * @param id 签名ID
     * @return 签名响应
     */
    @GetMapping("/{id}")
    public ApiResponse<SignatureResponse> getById(@PathVariable Long id) {
        log.debug("获取签名详情: id={}", id);
        SignatureResponse response = signatureService.getById(id);
        return ApiResponse.success(response);
    }

    /**
     * 创建签名
     *
     * @param request 创建请求
     * @return 签名响应
     */
    @PostMapping
    public ApiResponse<SignatureResponse> create(@Valid @RequestBody SignatureCreateRequest request) {
        log.info("创建签名请求: userId={}, signatureType={}",
                request.getUserId(), request.getSignatureType());
        SignatureResponse response = signatureService.create(request);
        return ApiResponse.success("签名创建成功", response);
    }

    /**
     * 删除签名
     *
     * @param id 签名ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        log.info("删除签名请求: id={}", id);
        signatureService.delete(id);
        return ApiResponse.success("签名删除成功", null);
    }

    /**
     * 设置默认签名
     * <p>
     * 将指定签名设为用户的默认签名
     * </p>
     *
     * @param id     签名ID
     * @param userId 用户ID
     * @return 签名响应
     */
    @PutMapping("/{id}/default")
    public ApiResponse<SignatureResponse> setDefault(
            @PathVariable Long id,
            @RequestParam Long userId) {

        log.info("设置默认签名请求: id={}, userId={}", id, userId);
        SignatureResponse response = signatureService.setDefault(id, userId);
        return ApiResponse.success("设置默认签名成功", response);
    }

    /**
     * 更新签名状态
     *
     * @param id     签名ID
     * @param status 新状态（0-禁用 1-启用）
     * @return 签名响应
     */
    @PutMapping("/{id}/status")
    public ApiResponse<SignatureResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {

        log.info("更新签名状态请求: id={}, status={}", id, status);
        SignatureResponse response = signatureService.updateStatus(id, status);
        return ApiResponse.success("状态更新成功", response);
    }

    // ==================== 签名生成接口 ====================

    /**
     * 保存手写签名
     * <p>
     * 接收 Base64 编码的手写签名图片并保存
     * </p>
     *
     * @param request 手写签名请求
     * @return 签名响应
     */
    @PostMapping("/handwrite")
    public ApiResponse<SignatureResponse> saveHandwriteSignature(
            @Valid @RequestBody HandwriteSignatureRequest request) {

        log.info("保存手写签名请求: userId={}", request.getUserId());
        SignatureResponse response = signatureGenerateService.saveHandwriteSignature(request);
        return ApiResponse.success("手写签名保存成功", response);
    }

    /**
     * 生成字体签名
     * <p>
     * 使用指定字体生成签名图片
     * </p>
     *
     * @param request 字体签名请求
     * @return 签名响应
     */
    @PostMapping("/generate")
    public ApiResponse<SignatureResponse> generateFontSignature(
            @Valid @RequestBody FontSignatureRequest request) {

        log.info("生成字体签名请求: userId={}, text={}, font={}",
                request.getUserId(), request.getText(), request.getFontName());
        SignatureResponse response = signatureGenerateService.generateFontSignature(request);
        return ApiResponse.success("字体签名生成成功", response);
    }

    /**
     * 获取可用字体列表
     * <p>
     * 返回系统中可用于签名生成的中文书法字体
     * </p>
     *
     * @return 字体信息列表
     */
    @GetMapping("/fonts")
    public ApiResponse<List<FontInfoResponse>> getAvailableFonts() {
        log.debug("获取可用字体列表");
        List<FontInfoResponse> fonts = signatureGenerateService.getAvailableFonts();
        return ApiResponse.success(fonts);
    }

    /**
     * 预览字体签名
     * <p>
     * 使用指定字体生成签名预览图片（Base64格式），不保存到数据库
     * </p>
     *
     * @param text      签名文字
     * @param fontName  字体名称
     * @param fontColor 字体颜色（可选）
     * @return Base64 编码的图片数据
     */
    @GetMapping("/preview")
    public ApiResponse<String> previewFontSignature(
            @RequestParam String text,
            @RequestParam String fontName,
            @RequestParam(required = false, defaultValue = "#000000") String fontColor) {

        log.debug("预览字体签名: text={}, fontName={}, color={}", text, fontName, fontColor);
        String previewImage = signatureGenerateService.previewFontSignature(text, fontName, fontColor);
        return ApiResponse.success(previewImage);
    }
}
