package cn.tcxingji.seal.service;

import cn.tcxingji.seal.dto.response.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传服务接口
 *
 * @author TC System
 */
public interface FileUploadService {

    /**
     * 上传印章图片
     *
     * @param file 上传的文件
     * @return 上传结果
     */
    FileUploadResponse uploadSealImage(MultipartFile file);

    /**
     * 上传合同文件
     *
     * @param file 上传的文件
     * @return 上传结果
     */
    FileUploadResponse uploadContractFile(MultipartFile file);

    /**
     * 上传签名图片
     *
     * @param file 上传的文件
     * @return 上传结果
     */
    FileUploadResponse uploadSignatureImage(MultipartFile file);

    /**
     * 删除文件
     *
     * @param filePath 文件路径
     * @return 是否删除成功
     */
    boolean deleteFile(String filePath);
}
