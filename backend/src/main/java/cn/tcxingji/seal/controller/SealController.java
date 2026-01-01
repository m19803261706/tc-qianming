package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.request.SealCreateRequest;
import cn.tcxingji.seal.dto.request.SealQueryRequest;
import cn.tcxingji.seal.dto.request.SealUpdateRequest;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SealResponse;
import cn.tcxingji.seal.service.SealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 印章管理控制器
 * <p>
 * 提供印章的增删改查 REST API 接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Slf4j
@RestController
@RequestMapping("/api/seals")
@RequiredArgsConstructor
public class SealController {

    private final SealService sealService;

    /**
     * 创建印章
     *
     * @param request 创建请求
     * @return 印章响应
     */
    @PostMapping
    public ApiResponse<SealResponse> create(@Valid @RequestBody SealCreateRequest request) {
        log.info("创建印章请求: {}", request.getSealName());
        SealResponse response = sealService.create(request);
        return ApiResponse.success("印章创建成功", response);
    }

    /**
     * 获取印章详情
     *
     * @param id 印章ID
     * @return 印章响应
     */
    @GetMapping("/{id}")
    public ApiResponse<SealResponse> getById(@PathVariable Long id) {
        log.debug("获取印章详情: id={}", id);
        SealResponse response = sealService.getById(id);
        return ApiResponse.success(response);
    }

    /**
     * 更新印章
     *
     * @param id      印章ID
     * @param request 更新请求
     * @return 印章响应
     */
    @PutMapping("/{id}")
    public ApiResponse<SealResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody SealUpdateRequest request) {
        log.info("更新印章请求: id={}", id);
        SealResponse response = sealService.update(id, request);
        return ApiResponse.success("印章更新成功", response);
    }

    /**
     * 删除印章
     *
     * @param id 印章ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        log.info("删除印章请求: id={}", id);
        sealService.delete(id);
        return ApiResponse.success("印章删除成功", null);
    }

    /**
     * 更新印章状态（启用/禁用）
     *
     * @param id     印章ID
     * @param status 新状态（0-禁用 1-启用）
     * @return 印章响应
     */
    @PutMapping("/{id}/status")
    public ApiResponse<SealResponse> updateStatus(@PathVariable Long id,
                                                  @RequestParam Integer status) {
        log.info("更新印章状态请求: id={}, status={}", id, status);
        SealResponse response = sealService.updateStatus(id, status);
        return ApiResponse.success("状态更新成功", response);
    }

    /**
     * 分页查询印章列表
     *
     * @param request 查询请求
     * @return 分页响应
     */
    @GetMapping
    public ApiResponse<PageResponse<SealResponse>> queryPage(SealQueryRequest request) {
        log.debug("分页查询印章列表: page={}, size={}", request.getPage(), request.getSize());
        PageResponse<SealResponse> response = sealService.queryPage(request);
        return ApiResponse.success(response);
    }

    /**
     * 获取所有者的所有印章
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 印章列表
     */
    @GetMapping("/owner/{ownerId}")
    public ApiResponse<List<SealResponse>> listByOwner(@PathVariable Long ownerId,
                                                       @RequestParam Integer ownerType) {
        log.debug("查询所有者印章列表: ownerId={}, ownerType={}", ownerId, ownerType);
        List<SealResponse> response = sealService.listByOwner(ownerId, ownerType);
        return ApiResponse.success(response);
    }

    /**
     * 获取所有者的启用印章
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 印章列表
     */
    @GetMapping("/owner/{ownerId}/enabled")
    public ApiResponse<List<SealResponse>> listEnabledByOwner(@PathVariable Long ownerId,
                                                              @RequestParam Integer ownerType) {
        log.debug("查询所有者启用印章列表: ownerId={}, ownerType={}", ownerId, ownerType);
        List<SealResponse> response = sealService.listEnabledByOwner(ownerId, ownerType);
        return ApiResponse.success(response);
    }
}
