package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.request.ContractQueryRequest;
import cn.tcxingji.seal.dto.request.ContractUploadRequest;
import cn.tcxingji.seal.dto.response.ContractPreviewResponse;
import cn.tcxingji.seal.dto.response.ContractResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 合同服务接口
 * <p>
 * 提供合同文件上传、查询、预览等功能
 * </p>
 *
 * @author TC System
 */
public interface ContractService {

    /**
     * 上传 PDF 合同文件
     *
     * @param file    PDF 文件
     * @param request 上传请求参数
     * @return 合同响应
     */
    ContractResponse upload(MultipartFile file, ContractUploadRequest request);

    /**
     * 根据 ID 获取合同详情
     *
     * @param id 合同ID
     * @return 合同响应
     */
    ContractResponse getById(Long id);

    /**
     * 分页查询合同列表
     *
     * @param request 查询请求
     * @return 分页响应
     */
    PageResponse<ContractResponse> queryPage(ContractQueryRequest request);

    /**
     * 根据所有者查询合同列表
     *
     * @param ownerId   所有者ID
     * @param ownerType 所有者类型
     * @return 合同列表
     */
    List<ContractResponse> listByOwner(Long ownerId, Integer ownerType);

    /**
     * 获取 PDF 预览（所有页）
     *
     * @param id 合同ID
     * @return 预览响应
     */
    ContractPreviewResponse preview(Long id);

    /**
     * 获取 PDF 单页预览
     *
     * @param id   合同ID
     * @param page 页码（从1开始）
     * @return 预览响应
     */
    ContractPreviewResponse previewPage(Long id, int page);

    /**
     * 删除合同
     *
     * @param id 合同ID
     */
    void delete(Long id);

    /**
     * 更新合同状态
     *
     * @param id     合同ID
     * @param status 新状态
     * @return 合同响应
     */
    ContractResponse updateStatus(Long id, Integer status);

    /**
     * 下载合同 PDF 文件
     *
     * @param id             合同ID
     * @param downloadSigned 是否下载签章后的版本（true-签章后，false-原始文件）
     * @return 文件资源
     */
    Resource download(Long id, boolean downloadSigned);
}
