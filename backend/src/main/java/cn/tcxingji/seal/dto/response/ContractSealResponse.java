package cn.tcxingji.seal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 合同盖章响应 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractSealResponse {

    /**
     * 合同ID
     */
    private Long contractId;

    /**
     * 签章后 PDF 文件URL
     */
    private String signedFileUrl;

    /**
     * 签章后文件路径
     */
    private String signedFilePath;

    /**
     * 签章记录列表
     */
    private List<SealRecordResponse> sealRecords;

    /**
     * 盖章数量
     */
    private Integer sealCount;

    /**
     * 处理消息
     */
    private String message;
}
