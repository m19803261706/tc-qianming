package cn.tcxingji.seal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件上传响应 DTO
 *
 * @author TC System
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {

    /**
     * 原始文件名
     */
    private String originalName;

    /**
     * 存储文件名
     */
    private String storedName;

    /**
     * 文件访问路径
     */
    private String filePath;

    /**
     * 文件访问 URL
     */
    private String fileUrl;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型
     */
    private String contentType;
}
