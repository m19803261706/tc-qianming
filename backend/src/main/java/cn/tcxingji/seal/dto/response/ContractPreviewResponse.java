package cn.tcxingji.seal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 合同预览响应 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractPreviewResponse {

    /**
     * 合同ID
     */
    private Long contractId;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 总页数
     */
    private Integer totalPages;

    /**
     * 当前页码
     */
    private Integer currentPage;

    /**
     * 预览图片URL列表
     */
    private List<String> previewUrls;

    /**
     * 单页预览图片URL（用于单页请求）
     */
    private String previewUrl;

    /**
     * 预览图片宽度（像素）
     */
    private Integer width;

    /**
     * 预览图片高度（像素）
     */
    private Integer height;

    /**
     * PDF 实际页面宽度（pt，用于坐标精确转换）
     */
    private Float pdfWidth;

    /**
     * PDF 实际页面高度（pt，用于坐标精确转换）
     */
    private Float pdfHeight;
}
