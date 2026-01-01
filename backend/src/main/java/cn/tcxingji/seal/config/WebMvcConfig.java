package cn.tcxingji.seal.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Web MVC 配置
 * <p>
 * 配置静态资源映射，使上传的文件可以通过 HTTP 访问
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileUploadConfig fileUploadConfig;

    /**
     * 配置静态资源映射
     * <p>
     * 将 /uploads/** 请求映射到文件系统的上传目录
     * 例如：/uploads/seals/2026/01/xxx.png -> ./uploads/seals/2026/01/xxx.png
     * </p>
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 获取上传目录的绝对路径
        String sealAbsPath = getAbsolutePath(fileUploadConfig.getSealPath());
        String contractAbsPath = getAbsolutePath(fileUploadConfig.getContractPath());
        String signatureAbsPath = getAbsolutePath(fileUploadConfig.getSignaturePath());

        // 映射印章图片目录: /uploads/seals/** -> file:./uploads/seals/
        registry.addResourceHandler("/uploads/seals/**")
                .addResourceLocations("file:" + sealAbsPath + "/");
        log.info("静态资源映射: /uploads/seals/** -> {}", sealAbsPath);

        // 映射合同文件目录: /uploads/contracts/** -> file:./uploads/contracts/
        registry.addResourceHandler("/uploads/contracts/**")
                .addResourceLocations("file:" + contractAbsPath + "/");
        log.info("静态资源映射: /uploads/contracts/** -> {}", contractAbsPath);

        // 映射签名图片目录: /uploads/signatures/** -> file:./uploads/signatures/
        registry.addResourceHandler("/uploads/signatures/**")
                .addResourceLocations("file:" + signatureAbsPath + "/");
        log.info("静态资源映射: /uploads/signatures/** -> {}", signatureAbsPath);
    }

    /**
     * 获取路径的绝对路径
     *
     * @param path 相对或绝对路径
     * @return 绝对路径字符串
     */
    private String getAbsolutePath(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        return Paths.get(path).toAbsolutePath().normalize().toString();
    }
}
