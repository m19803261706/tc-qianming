package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.config.FileUploadConfig;
import cn.tcxingji.seal.dto.request.FontSignatureRequest;
import cn.tcxingji.seal.dto.request.HandwriteSignatureRequest;
import cn.tcxingji.seal.dto.request.SignatureCreateRequest;
import cn.tcxingji.seal.dto.response.FontInfoResponse;
import cn.tcxingji.seal.dto.response.SignatureResponse;
import cn.tcxingji.seal.entity.PersonalSignature;
import cn.tcxingji.seal.exception.BusinessException;
import cn.tcxingji.seal.service.SignatureGenerateService;
import cn.tcxingji.seal.service.SignatureService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.font.FontRenderContext;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 签名生成服务实现类
 * <p>
 * 实现手写签名保存和字体签名生成功能
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SignatureGenerateServiceImpl implements SignatureGenerateService {

    private final FileUploadConfig fileUploadConfig;
    private final SignatureService signatureService;

    /**
     * 文件访问基础URL
     */
    @Value("${file.upload.base-url:}")
    private String baseUrl;

    /**
     * 已加载的自定义字体缓存
     */
    private final Map<String, Font> loadedFonts = new ConcurrentHashMap<>();

    /**
     * 项目内置的签名字体配置
     * fontFileName: 字体文件名（放在 resources/fonts/ 目录下）
     */
    private static final List<FontConfig> BUNDLED_FONTS = List.of(
            new FontConfig("霞鹜文楷", "霞鹜文楷", "LXGW WenKai", true,
                    "优雅的楷书风格，适合正式签名", "LXGWWenKai-Regular.ttf"),
            new FontConfig("霞鹜文楷轻体", "文楷轻体", "LXGW WenKai Light", true,
                    "纤细优美的楷书风格，清雅脱俗", "LXGWWenKai-Light.ttf"),
            new FontConfig("演示悠然小楷", "悠然小楷", "SlideYouran", true,
                    "清新的小楷风格，如青竹新生", "SlideYouran.ttf")
    );

    /**
     * 系统备选字体（当内置字体加载失败时使用）
     */
    private static final List<FontConfig> SYSTEM_FONTS = List.of(
            new FontConfig("华文行楷", "华文行楷", "STXingkai", false, "流畅的行楷风格", null),
            new FontConfig("楷体", "楷体", "KaiTi", false, "规范的楷书风格", null),
            new FontConfig("宋体", "宋体", "SimSun", false, "标准宋体", null)
    );

    /**
     * 初始化：加载内置字体文件
     */
    @PostConstruct
    public void initFonts() {
        log.info("开始加载内置签名字体...");

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();

        for (FontConfig fontConfig : BUNDLED_FONTS) {
            if (fontConfig.fontFileName == null) {
                continue;
            }

            try {
                String resourcePath = "classpath:fonts/" + fontConfig.fontFileName;
                Resource resource = resolver.getResource(resourcePath);

                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        Font font = Font.createFont(Font.TRUETYPE_FONT, is);
                        ge.registerFont(font);
                        loadedFonts.put(fontConfig.fontName, font);
                        log.info("成功加载字体: {} ({})", fontConfig.displayName, fontConfig.fontFileName);
                    }
                } else {
                    log.warn("字体文件不存在: {}", resourcePath);
                }
            } catch (Exception e) {
                log.error("加载字体失败: {} - {}", fontConfig.fontFileName, e.getMessage());
            }
        }

        log.info("字体加载完成，共加载 {} 个内置字体", loadedFonts.size());
    }

    @Override
    public SignatureResponse saveHandwriteSignature(HandwriteSignatureRequest request) {
        log.info("保存手写签名: userId={}", request.getUserId());

        try {
            // 1. 解析 Base64 图片数据
            byte[] imageBytes = decodeBase64Image(request.getImageData());

            // 2. 读取图片并处理透明背景
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (originalImage == null) {
                throw new BusinessException("无法解析签名图片数据");
            }

            // 3. 处理透明背景（如果需要）
            BufferedImage processedImage = ensureTransparentBackground(originalImage);

            // 4. 保存图片文件
            String relativePath = saveSignatureImage(processedImage, "handwrite");

            // 5. 创建签名记录
            SignatureCreateRequest createRequest = SignatureCreateRequest.builder()
                    .userId(request.getUserId())
                    .signatureName(request.getName() != null ? request.getName() : "手写签名")
                    .signatureImage(relativePath)
                    .signatureType(PersonalSignature.SignatureType.HANDWRITING)
                    .isDefault(Boolean.TRUE.equals(request.getSetDefault()) ? 1 : 0)
                    .createBy(request.getCreateBy())
                    .build();

            SignatureResponse response = signatureService.create(createRequest);
            log.info("手写签名保存成功: signatureId={}", response.getId());

            return response;

        } catch (IOException e) {
            log.error("保存手写签名失败: userId={}", request.getUserId(), e);
            throw new BusinessException("保存手写签名失败: " + e.getMessage());
        }
    }

    @Override
    public SignatureResponse generateFontSignature(FontSignatureRequest request) {
        log.info("生成字体签名: userId={}, text={}, font={}",
                request.getUserId(), request.getText(), request.getFontName());

        try {
            // 1. 获取字体
            Font font = getFont(request.getFontName(), request.getFontSize());

            // 2. 解析颜色
            Color fontColor = parseColor(request.getFontColor());

            // 3. 生成签名图片
            BufferedImage signatureImage = renderTextAsImage(request.getText(), font, fontColor);

            // 4. 保存图片文件
            String relativePath = saveSignatureImage(signatureImage, "font");

            // 5. 创建签名记录
            String signatureName = request.getSignatureName();
            if (signatureName == null || signatureName.isEmpty()) {
                signatureName = request.getText() + " - " + request.getFontName();
            }

            SignatureCreateRequest createRequest = SignatureCreateRequest.builder()
                    .userId(request.getUserId())
                    .signatureName(signatureName)
                    .signatureImage(relativePath)
                    .signatureType(PersonalSignature.SignatureType.FONT_GENERATED)
                    .fontName(request.getFontName())
                    .fontColor(request.getFontColor())
                    .textContent(request.getText())
                    .isDefault(Boolean.TRUE.equals(request.getSetDefault()) ? 1 : 0)
                    .createBy(request.getCreateBy())
                    .build();

            SignatureResponse response = signatureService.create(createRequest);
            log.info("字体签名生成成功: signatureId={}", response.getId());

            return response;

        } catch (Exception e) {
            log.error("生成字体签名失败: userId={}", request.getUserId(), e);
            throw new BusinessException("生成字体签名失败: " + e.getMessage());
        }
    }

    @Override
    public List<FontInfoResponse> getAvailableFonts() {
        log.debug("获取可用字体列表");

        List<FontInfoResponse> result = new ArrayList<>();

        // 1. 添加已成功加载的内置字体
        for (FontConfig fontConfig : BUNDLED_FONTS) {
            if (loadedFonts.containsKey(fontConfig.fontName)) {
                result.add(FontInfoResponse.builder()
                        .fontName(fontConfig.fontName)
                        .displayName(fontConfig.displayName)
                        .fontFamily(fontConfig.englishName)
                        .recommended(fontConfig.recommended)
                        .description(fontConfig.description)
                        .build());
            }
        }

        // 2. 如果内置字体不足，添加系统已安装的备选字体
        if (result.size() < 2) {
            GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
            Set<String> installedFonts = new HashSet<>(Arrays.asList(ge.getAvailableFontFamilyNames()));

            for (FontConfig fontConfig : SYSTEM_FONTS) {
                boolean installed = installedFonts.contains(fontConfig.fontName) ||
                        installedFonts.contains(fontConfig.displayName) ||
                        installedFonts.contains(fontConfig.englishName);

                if (installed) {
                    result.add(FontInfoResponse.builder()
                            .fontName(fontConfig.fontName)
                            .displayName(fontConfig.displayName)
                            .fontFamily(fontConfig.englishName)
                            .recommended(fontConfig.recommended)
                            .description(fontConfig.description)
                            .build());
                }
            }
        }

        // 3. 如果仍然没有字体，添加系统默认字体
        if (result.isEmpty()) {
            log.warn("未找到可用字体，添加系统默认宋体");
            result.add(FontInfoResponse.builder()
                    .fontName("宋体")
                    .displayName("宋体")
                    .fontFamily("SimSun")
                    .recommended(true)
                    .description("系统默认字体")
                    .build());
        }

        log.info("可用字体数量: {}", result.size());
        return result;
    }

    @Override
    public String previewFontSignature(String text, String fontName, String fontColor) {
        log.debug("生成字体签名预览: text={}, fontName={}, color={}", text, fontName, fontColor);

        try {
            // 1. 获取字体（预览使用较大字号）
            Font font = getFont(fontName, 72);

            // 2. 解析颜色
            Color color = parseColor(fontColor);

            // 3. 生成签名图片
            BufferedImage signatureImage = renderTextAsImage(text, font, color);

            // 4. 转换为 Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(signatureImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            return "data:image/png;base64," + base64Image;

        } catch (Exception e) {
            log.error("生成字体签名预览失败: text={}, fontName={}", text, fontName, e);
            throw new BusinessException("生成预览失败: " + e.getMessage());
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 解码 Base64 图片数据
     *
     * @param imageData Base64 编码的图片数据
     * @return 图片字节数组
     */
    private byte[] decodeBase64Image(String imageData) {
        String base64Data = imageData;

        // 移除 Data URL 前缀（如果有）
        if (imageData.contains(",")) {
            base64Data = imageData.substring(imageData.indexOf(",") + 1);
        }

        // 移除可能的空白字符
        base64Data = base64Data.replaceAll("\\s", "");

        return Base64.getDecoder().decode(base64Data);
    }

    /**
     * 确保图片具有透明背景
     *
     * @param original 原始图片
     * @return 处理后的图片
     */
    private BufferedImage ensureTransparentBackground(BufferedImage original) {
        // 如果已经是 ARGB 格式，直接返回
        if (original.getType() == BufferedImage.TYPE_INT_ARGB) {
            return original;
        }

        // 创建新的 ARGB 图片
        BufferedImage newImage = new BufferedImage(
                original.getWidth(),
                original.getHeight(),
                BufferedImage.TYPE_INT_ARGB
        );

        Graphics2D g2d = newImage.createGraphics();
        try {
            // 设置透明背景
            g2d.setComposite(AlphaComposite.Clear);
            g2d.fillRect(0, 0, newImage.getWidth(), newImage.getHeight());

            // 绘制原图
            g2d.setComposite(AlphaComposite.SrcOver);
            g2d.drawImage(original, 0, 0, null);
        } finally {
            g2d.dispose();
        }

        return newImage;
    }

    /**
     * 获取字体
     *
     * @param fontName 字体名称
     * @param fontSize 字体大小
     * @return Font 对象
     */
    private Font getFont(String fontName, int fontSize) {
        // 1. 优先使用已加载的内置字体
        Font loadedFont = loadedFonts.get(fontName);
        if (loadedFont != null) {
            log.debug("使用内置字体: {}", fontName);
            return loadedFont.deriveFont((float) fontSize);
        }

        // 2. 尝试查找内置字体配置并使用英文名
        for (FontConfig fc : BUNDLED_FONTS) {
            if (fc.fontName.equals(fontName) || fc.displayName.equals(fontName)) {
                Font cached = loadedFonts.get(fc.fontName);
                if (cached != null) {
                    return cached.deriveFont((float) fontSize);
                }
            }
        }

        // 3. 尝试系统字体
        Font font = new Font(fontName, Font.PLAIN, fontSize);

        // 检查字体是否可用
        if (!font.getFamily().equals(fontName) && !font.getName().equals(fontName)) {
            // 尝试使用备选字体名称
            for (FontConfig fc : SYSTEM_FONTS) {
                if (fc.fontName.equals(fontName) || fc.displayName.equals(fontName)) {
                    font = new Font(fc.englishName, Font.PLAIN, fontSize);
                    break;
                }
            }
        }

        log.debug("使用系统字体: {} (实际: {})", fontName, font.getFamily());
        return font;
    }

    /**
     * 解析颜色
     *
     * @param colorStr 颜色字符串（十六进制）
     * @return Color 对象
     */
    private Color parseColor(String colorStr) {
        if (colorStr == null || colorStr.isEmpty()) {
            return Color.BLACK;
        }
        try {
            return Color.decode(colorStr);
        } catch (NumberFormatException e) {
            log.warn("无效的颜色值: {}，使用黑色", colorStr);
            return Color.BLACK;
        }
    }

    /**
     * 将文本渲染为图片
     *
     * @param text  文本内容
     * @param font  字体
     * @param color 颜色
     * @return 签名图片
     */
    private BufferedImage renderTextAsImage(String text, Font font, Color color) {
        // 创建临时图片以计算文字尺寸
        BufferedImage tempImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
        Graphics2D tempG2d = tempImage.createGraphics();
        tempG2d.setFont(font);

        FontRenderContext frc = tempG2d.getFontRenderContext();
        Rectangle2D bounds = font.getStringBounds(text, frc);
        tempG2d.dispose();

        // 计算图片尺寸（添加边距）
        int padding = 20;
        int width = (int) Math.ceil(bounds.getWidth()) + padding * 2;
        int height = (int) Math.ceil(bounds.getHeight()) + padding * 2;

        // 创建透明背景图片
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = image.createGraphics();

        try {
            // 设置抗锯齿
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

            // 设置字体和颜色
            g2d.setFont(font);
            g2d.setColor(color);

            // 计算文字位置（居中）
            FontMetrics fm = g2d.getFontMetrics();
            int x = padding;
            int y = padding + fm.getAscent();

            // 绘制文字
            g2d.drawString(text, x, y);

        } finally {
            g2d.dispose();
        }

        return image;
    }

    /**
     * 保存签名图片
     *
     * @param image 图片
     * @param type  类型（handwrite/font）
     * @return 相对路径
     */
    private String saveSignatureImage(BufferedImage image, String type) throws IOException {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fileName = String.format("sig_%s_%s_%s.png",
                type,
                dateStr,
                UUID.randomUUID().toString().replace("-", "").substring(0, 8));

        String subDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path targetDir = Paths.get(fileUploadConfig.getSignaturePath(), subDir);

        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        Path targetPath = targetDir.resolve(fileName);
        ImageIO.write(image, "PNG", targetPath.toFile());

        log.info("签名图片保存成功: {}", targetPath);

        return "/uploads/signatures/" + subDir + "/" + fileName;
    }

    // ==================== 内部类 ====================

    /**
     * 字体配置
     *
     * @param fontName     字体名称（用于查找和存储）
     * @param displayName  显示名称（用于前端展示）
     * @param englishName  英文名称（系统字体名）
     * @param recommended  是否推荐
     * @param description  字体描述
     * @param fontFileName 字体文件名（内置字体专用，系统字体为 null）
     */
    private record FontConfig(
            String fontName,
            String displayName,
            String englishName,
            boolean recommended,
            String description,
            String fontFileName
    ) {
        /**
         * 系统字体构造方法（无字体文件）
         */
        FontConfig(String fontName, String displayName, String englishName,
                   boolean recommended, String description) {
            this(fontName, displayName, englishName, recommended, description, null);
        }
    }
}
