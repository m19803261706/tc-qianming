package cn.tcxingji.seal.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 文件上传配置类
 * 读取 application.yml 中的 file.upload 配置
 *
 * @author TC System
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "file.upload")
public class FileUploadConfig {

    /**
     * 印章图片存储路径
     */
    private String sealPath;

    /**
     * 合同文件存储路径
     */
    private String contractPath;

    /**
     * 签名图片存储路径
     */
    private String signaturePath;

    /**
     * 应用启动时自动创建存储目录
     */
    @PostConstruct
    public void init() {
        createDirectoryIfNotExists(sealPath, "印章图片");
        createDirectoryIfNotExists(contractPath, "合同文件");
        createDirectoryIfNotExists(signaturePath, "签名图片");
    }

    /**
     * 创建目录（如果不存在）
     *
     * @param path 目录路径
     * @param name 目录名称（用于日志）
     */
    private void createDirectoryIfNotExists(String path, String name) {
        if (path == null || path.isEmpty()) {
            log.warn("{}存储路径未配置", name);
            return;
        }

        Path dirPath = Paths.get(path);
        if (!Files.exists(dirPath)) {
            try {
                Files.createDirectories(dirPath);
                log.info("创建{}存储目录: {}", name, path);
            } catch (IOException e) {
                log.error("创建{}存储目录失败: {}", name, path, e);
            }
        } else {
            log.info("{}存储目录已存在: {}", name, path);
        }
    }
}
