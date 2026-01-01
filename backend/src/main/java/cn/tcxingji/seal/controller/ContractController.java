package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.request.ContractQueryRequest;
import cn.tcxingji.seal.dto.request.ContractSealRequest;
import cn.tcxingji.seal.dto.request.ContractUploadRequest;
import cn.tcxingji.seal.dto.request.PerforationSealRequest;
import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.ContractPreviewResponse;
import cn.tcxingji.seal.dto.response.ContractResponse;
import cn.tcxingji.seal.dto.response.ContractSealResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SealRecordResponse;
import cn.tcxingji.seal.service.ContractService;
import cn.tcxingji.seal.service.SealStampService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
    private final SealStampService sealStampService;

    /**
     * 上传 PDF 合同文件
     *
     * @param file         PDF 文件
     * @param ownerId      所有者ID
     * @param ownerType    所有者类型（可选，默认1-企业）
     * @param contractName 合同名称（可选，不填则使用文件名）
     * @param remark       备注（可选）
     * @return 合同响应
     */
    @PostMapping("/upload")
    public ApiResponse<ContractResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam(value = "ownerType", defaultValue = "1") Integer ownerType,
            @RequestParam(value = "contractName", required = false) String contractName,
            @RequestParam(value = "remark", required = false) String remark) {

        log.info("上传合同: originalName={}, contractName={}, size={}, ownerId={}",
                file.getOriginalFilename(), contractName, file.getSize(), ownerId);

        ContractUploadRequest request = ContractUploadRequest.builder()
                .ownerId(ownerId)
                .ownerType(ownerType)
                .contractName(contractName)
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

    // ==================== 盖章接口 ====================

    /**
     * 执行盖章
     * <p>
     * 在合同指定位置盖章
     * </p>
     *
     * @param id      合同ID
     * @param request 盖章请求
     * @return 盖章响应
     */
    @PostMapping("/{id}/seal")
    public ApiResponse<ContractSealResponse> seal(
            @PathVariable Long id,
            @Valid @RequestBody ContractSealRequest request) {

        log.info("执行盖章: contractId={}, sealId={}, positions={}",
                id, request.getSealId(), request.getPositions().size());
        ContractSealResponse response = sealStampService.stamp(id, request);
        return ApiResponse.success("盖章成功", response);
    }

    /**
     * 批量盖章
     * <p>
     * 使用多个印章在多个位置盖章
     * </p>
     *
     * @param id       合同ID
     * @param requests 盖章请求列表
     * @return 盖章响应
     */
    @PostMapping("/{id}/seal/batch")
    public ApiResponse<ContractSealResponse> batchSeal(
            @PathVariable Long id,
            @Valid @RequestBody List<ContractSealRequest> requests) {

        log.info("批量盖章: contractId={}, 印章数={}", id, requests.size());
        ContractSealResponse response = sealStampService.batchStamp(id, requests);
        return ApiResponse.success("批量盖章成功", response);
    }

    /**
     * 获取合同的签章记录
     *
     * @param id 合同ID
     * @return 签章记录列表
     */
    @GetMapping("/{id}/seal/records")
    public ApiResponse<List<SealRecordResponse>> getSealRecords(@PathVariable Long id) {
        log.debug("获取签章记录: contractId={}", id);
        List<SealRecordResponse> response = sealStampService.getRecords(id);
        return ApiResponse.success(response);
    }

    /**
     * 添加骑缝章
     * <p>
     * 将印章按页数分割，每页右边缘显示一部分，合并后形成完整印章
     * </p>
     *
     * @param id      合同ID
     * @param request 骑缝章请求
     * @return 盖章响应
     */
    @PostMapping("/{id}/seal/perforation")
    public ApiResponse<ContractSealResponse> perforationSeal(
            @PathVariable Long id,
            @Valid @RequestBody PerforationSealRequest request) {

        log.info("添加骑缝章: contractId={}, sealId={}", id, request.getSealId());
        ContractSealResponse response = sealStampService.perforationStamp(id, request);
        return ApiResponse.success("骑缝章添加成功", response);
    }

    // ==================== 下载接口 ====================

    /**
     * 下载合同 PDF
     * <p>
     * 优先下载签章后的 PDF，如果没有签章则下载原始 PDF
     * </p>
     *
     * @param id   合同ID
     * @param type 下载类型：signed-签章后, original-原始文件（默认signed）
     * @return PDF 文件流
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @RequestParam(value = "type", defaultValue = "signed") String type) {

        log.info("下载合同: contractId={}, type={}", id, type);

        boolean downloadSigned = !"original".equalsIgnoreCase(type);
        Resource resource = contractService.download(id, downloadSigned);
        ContractResponse contract = contractService.getById(id);

        // 构建文件名
        String fileName = contract.getContractName();
        if (fileName == null || fileName.isEmpty()) {
            fileName = contract.getFileName();
        }
        // 确保文件名以 .pdf 结尾
        if (!fileName.toLowerCase().endsWith(".pdf")) {
            fileName += ".pdf";
        }
        // 如果是签章后的文件，添加标识
        if (downloadSigned && contract.getSignedUrl() != null) {
            fileName = fileName.replace(".pdf", "_已签章.pdf");
        }

        // URL 编码文件名，处理中文
        String encodedFileName;
        try {
            encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString())
                    .replaceAll("\\+", "%20");
        } catch (UnsupportedEncodingException e) {
            encodedFileName = "contract.pdf";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }
}
