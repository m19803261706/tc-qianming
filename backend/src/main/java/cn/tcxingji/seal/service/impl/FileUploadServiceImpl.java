package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.config.FileUploadConfig;
import cn.tcxingji.seal.dto.response.FileUploadResponse;
import cn.tcxingji.seal.exception.BusinessException;
import cn.tcxingji.seal.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件上传服务实现类
 *
 * @author TC System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final FileUploadConfig fileUploadConfig;

    /**
     * 允许的图片类型
     */
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/png",
            "image/jpeg",
            "image/jpg"
    );

    /**
     * 允许的合同文件类型
     */
    private static final List<String> ALLOWED_CONTRACT_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    /**
     * 印章图片最大大小: 5MB
     */
    private static final long MAX_SEAL_IMAGE_SIZE = 5 * 1024 * 1024;

    /**
     * 合同文件最大大小: 50MB
     */
    private static final long MAX_CONTRACT_SIZE = 50 * 1024 * 1024;

    @Override
    public FileUploadResponse uploadSealImage(MultipartFile file) {
        // 校验文件
        validateFile(file, ALLOWED_IMAGE_TYPES, MAX_SEAL_IMAGE_SIZE, "印章图片");

        // 上传文件
        return uploadFile(file, fileUploadConfig.getSealPath(), "seal");
    }

    @Override
    public FileUploadResponse uploadContractFile(MultipartFile file) {
        // 校验文件
        validateFile(file, ALLOWED_CONTRACT_TYPES, MAX_CONTRACT_SIZE, "合同文件");

        // 上传文件
        return uploadFile(file, fileUploadConfig.getContractPath(), "contract");
    }

    @Override
    public FileUploadResponse uploadSignatureImage(MultipartFile file) {
        // 校验文件
        validateFile(file, ALLOWED_IMAGE_TYPES, MAX_SEAL_IMAGE_SIZE, "签名图片");

        // 上传文件
        return uploadFile(file, fileUploadConfig.getSignaturePath(), "signature");
    }

    @Override
    public boolean deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }

        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("删除文件成功: {}", filePath);
                return true;
            }
            log.warn("文件不存在: {}", filePath);
            return false;
        } catch (IOException e) {
            log.error("删除文件失败: {}", filePath, e);
            return false;
        }
    }

    /**
     * 校验上传文件
     *
     * @param file         上传的文件
     * @param allowedTypes 允许的文件类型
     * @param maxSize      最大文件大小（字节）
     * @param typeName     文件类型名称（用于错误提示）
     */
    private void validateFile(MultipartFile file, List<String> allowedTypes, long maxSize, String typeName) {
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的文件");
        }

        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new BusinessException(typeName + "格式不支持，允许的格式: " + getAllowedExtensions(allowedTypes));
        }

        // 检查文件大小
        if (file.getSize() > maxSize) {
            throw new BusinessException(typeName + "大小不能超过 " + formatFileSize(maxSize));
        }

        // 检查原始文件名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new BusinessException("无法获取文件名");
        }

        log.debug("文件校验通过: name={}, type={}, size={}",
                originalFilename, contentType, formatFileSize(file.getSize()));
    }

    /**
     * 上传文件到指定目录
     *
     * @param file     上传的文件
     * @param basePath 基础存储路径
     * @param prefix   文件名前缀
     * @return 上传结果
     */
    private FileUploadResponse uploadFile(MultipartFile file, String basePath, String prefix) {
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);

        // 生成存储文件名: prefix_yyyyMMdd_uuid.ext
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String storedName = String.format("%s_%s_%s%s", prefix, dateStr,
                UUID.randomUUID().toString().replace("-", "").substring(0, 12), extension);

        // 按日期创建子目录
        String subDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path targetDir = Paths.get(basePath, subDir);

        try {
            // 创建目录
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            // 保存文件
            Path targetPath = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("文件上传成功: {} -> {}", originalFilename, targetPath);

            // 构建响应
            String relativePath = subDir + "/" + storedName;
            return FileUploadResponse.builder()
                    .originalName(originalFilename)
                    .storedName(storedName)
                    .filePath(targetPath.toString())
                    .fileUrl("/uploads/" + prefix + "s/" + relativePath)  // URL 路径
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

        } catch (IOException e) {
            log.error("文件上传失败: {}", originalFilename, e);
            throw new BusinessException("文件上传失败，请重试");
        }
    }

    /**
     * 获取文件扩展名
     *
     * @param filename 文件名
     * @return 扩展名（包含点号）
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }

    /**
     * 格式化文件大小
     *
     * @param size 文件大小（字节）
     * @return 格式化后的大小字符串
     */
    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + "B";
        } else if (size < 1024 * 1024) {
            return String.format("%.1fKB", size / 1024.0);
        } else {
            return String.format("%.1fMB", size / (1024.0 * 1024.0));
        }
    }

    /**
     * 获取允许的文件扩展名列表
     *
     * @param contentTypes MIME 类型列表
     * @return 扩展名字符串
     */
    private String getAllowedExtensions(List<String> contentTypes) {
        StringBuilder sb = new StringBuilder();
        for (String type : contentTypes) {
            switch (type) {
                case "image/png" -> sb.append("PNG, ");
                case "image/jpeg", "image/jpg" -> sb.append("JPG, ");
                case "application/pdf" -> sb.append("PDF, ");
                case "application/msword" -> sb.append("DOC, ");
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> sb.append("DOCX, ");
            }
        }
        String result = sb.toString();
        return result.isEmpty() ? "" : result.substring(0, result.length() - 2);
    }
}
