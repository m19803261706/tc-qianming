package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.request.ContractSealRequest;
import cn.tcxingji.seal.dto.response.ContractSealResponse;
import cn.tcxingji.seal.dto.response.SealRecordResponse;

import java.util.List;

/**
 * 盖章服务接口
 * <p>
 * 提供 PDF 文档盖章功能
 * </p>
 *
 * @author TC System
 */
public interface SealStampService {

    /**
     * 执行盖章
     * <p>
     * 在指定合同的指定位置盖章，生成新的签章后 PDF 文件
     * </p>
     *
     * @param contractId 合同ID
     * @param request    盖章请求
     * @return 盖章响应
     */
    ContractSealResponse stamp(Long contractId, ContractSealRequest request);

    /**
     * 批量盖章
     * <p>
     * 使用多个印章在多个位置盖章
     * </p>
     *
     * @param contractId 合同ID
     * @param requests   盖章请求列表
     * @return 盖章响应
     */
    ContractSealResponse batchStamp(Long contractId, List<ContractSealRequest> requests);

    /**
     * 获取合同的签章记录
     *
     * @param contractId 合同ID
     * @return 签章记录列表
     */
    List<SealRecordResponse> getRecords(Long contractId);
}
