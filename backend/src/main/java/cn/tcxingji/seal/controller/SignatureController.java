package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.request.SignatureCreateRequest;
import cn.tcxingji.seal.dto.request.SignatureQueryRequest;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SignatureResponse;
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
}
