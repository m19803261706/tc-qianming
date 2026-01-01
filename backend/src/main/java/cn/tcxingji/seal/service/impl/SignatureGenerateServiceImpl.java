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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.font.FontRenderContext;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

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
     * 推荐用于签名的中文字体列表
     */
    private static final List<FontConfig> SIGNATURE_FONTS = List.of(
            new FontConfig("华文行楷", "华文行楷", "STXingkai", true, "流畅的行楷风格，适合正式签名"),
            new FontConfig("华文新魏", "华文新魏", "STXinwei", true, "端庄的魏碑风格，适合庄重场合"),
            new FontConfig("楷体", "楷体", "KaiTi", true, "规范的楷书风格，清晰易读"),
            new FontConfig("华文隶书", "华文隶书", "STLiti", false, "古朴的隶书风格"),
            new FontConfig("华文琥珀", "华文琥珀", "STHupo", false, "饱满圆润的风格"),
            new FontConfig("方正舒体", "方正舒体", "FZShuTi", false, "舒展流畅的书法风格"),
            new FontConfig("宋体", "宋体", "SimSun", false, "标准宋体，正式文档常用")
    );

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

        // 获取系统已安装的字体
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        Set<String> installedFonts = new HashSet<>(Arrays.asList(ge.getAvailableFontFamilyNames()));

        List<FontInfoResponse> result = new ArrayList<>();

        for (FontConfig fontConfig : SIGNATURE_FONTS) {
            // 检查字体是否已安装（检查多个可能的名称）
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

        // 如果没有找到推荐字体，添加系统默认字体
        if (result.isEmpty()) {
            log.warn("未找到推荐的中文书法字体，添加系统默认字体");
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
        Font font = new Font(fontName, Font.PLAIN, fontSize);

        // 检查字体是否可用
        if (!font.getFamily().equals(fontName) && !font.getName().equals(fontName)) {
            // 尝试使用备选字体名称
            for (FontConfig fc : SIGNATURE_FONTS) {
                if (fc.fontName.equals(fontName) || fc.displayName.equals(fontName)) {
                    font = new Font(fc.englishName, Font.PLAIN, fontSize);
                    break;
                }
            }
        }

        log.debug("使用字体: {} (实际: {})", fontName, font.getFamily());
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
     */
    private record FontConfig(
            String fontName,
            String displayName,
            String englishName,
            boolean recommended,
            String description
    ) {}
}
