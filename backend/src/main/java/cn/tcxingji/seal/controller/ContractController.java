package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.request.ContractQueryRequest;
import cn.tcxingji.seal.dto.request.ContractUploadRequest;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.ContractPreviewResponse;
import cn.tcxingji.seal.dto.response.ContractResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 合同管理控制器
 * <p>
 * 提供合同的上传、查询、预览等 REST API 接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Slf4j
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    /**
     * 上传 PDF 合同文件
     *
     * @param file    PDF 文件
     * @param ownerId 所有者ID
     * @param ownerType 所有者类型（可选，默认1-企业）
     * @param remark  备注（可选）
     * @return 合同响应
     */
    @PostMapping("/upload")
    public ApiResponse<ContractResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam(value = "ownerType", defaultValue = "1") Integer ownerType,
            @RequestParam(value = "remark", required = false) String remark) {

        log.info("上传合同: originalName={}, size={}, ownerId={}",
                file.getOriginalFilename(), file.getSize(), ownerId);

        ContractUploadRequest request = ContractUploadRequest.builder()
                .ownerId(ownerId)
                .ownerType(ownerType)
                .remark(remark)
                .build();

        ContractResponse response = contractService.upload(file, request);
        return ApiResponse.success("合同上传成功", response);
    }

    /**
     * 获取合同详情
     *
     * @param id 合同ID
     * @return 合同响应
     */
    @GetMapping("/{id}")
    public ApiResponse<ContractResponse> getById(@PathVariable Long id) {
        log.debug("获取合同详情: id={}", id);
        ContractResponse response = contractService.getById(id);
        return ApiResponse.success(response);
    }

    /**
     * 分页查询合同列表
     *
     * @param request 查询请求
     * @return 分页响应
     */
    @GetMapping
    public ApiResponse<PageResponse<ContractResponse>> queryPage(ContractQueryRequest request) {
        log.debug("分页查询合同: page={}, size={}", request.getPage(), request.getSize());
        PageResponse<ContractResponse> response = contractService.queryPage(request);
        return ApiResponse.success(response);
    }

    /**
     * 根据所有者查询合同列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 合同列表
     */
    @GetMapping("/owner/{ownerId}")
    public ApiResponse<List<ContractResponse>> listByOwner(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "1") Integer ownerType) {

        log.debug("查询所有者合同: ownerId={}, ownerType={}", ownerId, ownerType);
        List<ContractResponse> response = contractService.listByOwner(ownerId, ownerType);
        return ApiResponse.success(response);
    }

    /**
     * 预览合同（所有页）
     *
     * @param id 合同ID
     * @return 预览响应
     */
    @GetMapping("/{id}/preview")
    public ApiResponse<ContractPreviewResponse> preview(@PathVariable Long id) {
        log.info("预览合同: id={}", id);
        ContractPreviewResponse response = contractService.preview(id);
        return ApiResponse.success(response);
    }

    /**
     * 预览合同指定页
     *
     * @param id   合同ID
     * @param page 页码（从1开始）
     * @return 预览响应
     */
    @GetMapping("/{id}/preview/{page}")
    public ApiResponse<ContractPreviewResponse> previewPage(
            @PathVariable Long id,
            @PathVariable Integer page) {

        log.debug("预览合同指定页: id={}, page={}", id, page);
        ContractPreviewResponse response = contractService.previewPage(id, page);
        return ApiResponse.success(response);
    }

    /**
     * 删除合同
     *
     * @param id 合同ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        log.info("删除合同: id={}", id);
        contractService.delete(id);
        return ApiResponse.success("合同删除成功", null);
    }

    /**
     * 更新合同状态
     *
     * @param id     合同ID
     * @param status 新状态
     * @return 合同响应
     */
    @PutMapping("/{id}/status")
    public ApiResponse<ContractResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {

        log.info("更新合同状态: id={}, status={}", id, status);
        ContractResponse response = contractService.updateStatus(id, status);
        return ApiResponse.success("状态更新成功", response);
    }
}
