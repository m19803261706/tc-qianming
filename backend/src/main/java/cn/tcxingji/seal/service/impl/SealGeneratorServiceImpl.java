package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.config.FileUploadConfig;
import cn.tcxingji.seal.dto.request.SealGenerateRequest;
import cn.tcxingji.seal.dto.response.FileUploadResponse;
import cn.tcxingji.seal.enums.SealTemplate;
import cn.tcxingji.seal.exception.BusinessException;
import cn.tcxingji.seal.service.SealGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.font.FontRenderContext;
import java.awt.font.GlyphVector;
import java.awt.geom.AffineTransform;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 印章生成服务实现类
 * <p>
 * 使用 Java Graphics2D 绘制各类印章
 * </p>
 *
 * @author TC System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SealGeneratorServiceImpl implements SealGeneratorService {

    private final FileUploadConfig fileUploadConfig;

    /**
     * 默认印章颜色（红色）
     */
    private static final Color DEFAULT_SEAL_COLOR = new Color(220, 40, 40);

    /**
     * 图片 DPI（清晰度）
     */
    private static final int IMAGE_DPI = 300;

    @Override
    public FileUploadResponse generateSeal(SealGenerateRequest request) {
        // 获取模板
        SealTemplate template = getTemplate(request.getTemplateCode());

        // 获取尺寸（自定义或模板默认）
        int size = request.getSize() != null ? request.getSize() : template.getBaseSize();

        // 解析颜色
        Color sealColor = parseColor(request.getColor());

        // 生成印章图片
        BufferedImage sealImage = switch (template) {
            case STANDARD_CIRCLE -> generateCircleSeal(
                    request.getCompanyName(),
                    request.getCenterText(),
                    size,
                    sealColor,
                    template
            );
            case OVAL_FINANCE -> generateOvalSeal(
                    request.getCompanyName(),
                    request.getCenterText(),
                    size,
                    sealColor
            );
            case SQUARE_LEGAL -> generateSquareSeal(
                    request.getCompanyName(),
                    size,
                    sealColor
            );
        };

        // 保存图片并返回结果
        return saveImage(sealImage, request.getCompanyName());
    }

    @Override
    public List<SealTemplate> getTemplates() {
        return Arrays.asList(SealTemplate.values());
    }

    /**
     * 生成标准圆形公章
     *
     * @param companyName 企业名称
     * @param centerText  中心文字
     * @param radius      半径
     * @param color       颜色
     * @param template    模板
     * @return 印章图片
     */
    private BufferedImage generateCircleSeal(String companyName, String centerText,
                                              int radius, Color color, SealTemplate template) {
        /*
         * 公章标准规范 (GB标准，以42mm直径为例):
         * - 直径: 42mm (150px, 约3.57px/mm)
         * - 边框宽度: 1.2mm (约4px)
         * - 五角星直径: 14mm (约50px，半径25px，占总直径的1/3)
         * - 五角星位置: 上移0.5mm
         * - 环绕文字角度: 270° (自左而右环行)
         * - 文字高度: 6.5-8mm
         * - 文字与边框距离: 0.5-1mm
         */
        int imageSize = radius * 2 + 40;  // 留边距
        BufferedImage image = createTransparentImage(imageSize, imageSize);
        Graphics2D g2d = createGraphics(image);

        int centerX = imageSize / 2;
        int centerY = imageSize / 2;

        // 按标准比例计算各部分尺寸
        int borderWidth = Math.max(3, radius / 38);  // 边框宽度 (42mm时约1.2mm)
        int starRadius = radius / 3;  // 五角星半径 (标准: 直径的1/3)
        int textMargin = Math.max(3, radius / 50);  // 文字与边框的间距

        try {
            g2d.setColor(color);

            // 1. 绘制外圆边框
            if (template.isHasBorder()) {
                g2d.setStroke(new BasicStroke(borderWidth));
                g2d.draw(new Ellipse2D.Double(
                        centerX - radius + borderWidth / 2.0,
                        centerY - radius + borderWidth / 2.0,
                        radius * 2 - borderWidth,
                        radius * 2 - borderWidth
                ));
            }

            // 2. 绘制五角星 (标准: 上移0.5mm，约2px)
            if (template.isHasStar()) {
                int starOffsetY = Math.max(1, radius / 75);  // 上移量
                drawStar(g2d, centerX, centerY - starOffsetY, starRadius);
            }

            // 3. 绘制环绕文字 (270°范围，自左而右)
            // 计算字体大小（需与 drawCircleText 中的计算保持一致）
            int baseFontSize = (int) (radius * 0.36);
            int fontSize = companyName.length() > 14 ? baseFontSize - 4 :
                           companyName.length() > 10 ? baseFontSize - 2 : baseFontSize;
            fontSize = Math.max(16, Math.min(fontSize, 32));

            // 文字环绕半径 = 边框内边缘 - 上间距 - 字体高度的一半
            // 这样文字顶部（朝外）才能与边框保持适当间距
            int topMargin = Math.max(5, radius / 20);  // 文字顶部与边框的间距 (约5%)
            int textRadius = radius - borderWidth - topMargin - fontSize / 2;
            drawCircleText(g2d, companyName, centerX, centerY, textRadius, color, radius);

            // 4. 绘制中心文字（在五角星下方）
            if (centerText != null && !centerText.isEmpty()) {
                int centerTextY = centerY + starRadius + 8;  // 五角星下方
                drawCenterText(g2d, centerText, centerX, centerTextY, color, radius);
            }

        } finally {
            g2d.dispose();
        }

        return image;
    }

    /**
     * 生成椭圆形财务章
     */
    private BufferedImage generateOvalSeal(String companyName, String centerText,
                                            int baseSize, Color color) {
        int width = (int) (baseSize * 1.5);
        int height = baseSize;
        int imageWidth = width + 40;
        int imageHeight = height + 40;

        BufferedImage image = createTransparentImage(imageWidth, imageHeight);
        Graphics2D g2d = createGraphics(image);

        int centerX = imageWidth / 2;
        int centerY = imageHeight / 2;

        try {
            g2d.setColor(color);

            // 绘制椭圆边框
            g2d.setStroke(new BasicStroke(4));
            g2d.draw(new Ellipse2D.Double(
                    centerX - width / 2.0,
                    centerY - height / 2.0,
                    width,
                    height
            ));

            // 绘制文字（横向）
            Font font = new Font("宋体", Font.BOLD, 24);
            g2d.setFont(font);
            FontMetrics fm = g2d.getFontMetrics();

            // 上方文字：企业名称
            int nameWidth = fm.stringWidth(companyName);
            g2d.drawString(companyName, centerX - nameWidth / 2, centerY - 5);

            // 下方文字：中心文字
            if (centerText != null && !centerText.isEmpty()) {
                int textWidth = fm.stringWidth(centerText);
                g2d.drawString(centerText, centerX - textWidth / 2, centerY + fm.getHeight());
            }

        } finally {
            g2d.dispose();
        }

        return image;
    }

    /**
     * 生成方形法人章
     */
    private BufferedImage generateSquareSeal(String name, int size, Color color) {
        int imageSize = size + 40;
        BufferedImage image = createTransparentImage(imageSize, imageSize);
        Graphics2D g2d = createGraphics(image);

        int centerX = imageSize / 2;
        int centerY = imageSize / 2;
        int halfSize = size / 2;

        try {
            g2d.setColor(color);

            // 绘制方形边框
            g2d.setStroke(new BasicStroke(4));
            g2d.drawRect(centerX - halfSize, centerY - halfSize, size, size);

            // 绘制文字（竖排）
            Font font = new Font("宋体", Font.BOLD, size / 3);
            g2d.setFont(font);

            // 将名字拆分成单个字符，竖向排列
            char[] chars = name.toCharArray();
            int charHeight = size / Math.max(chars.length, 2);
            int startY = centerY - (chars.length * charHeight) / 2 + charHeight / 2;

            FontMetrics fm = g2d.getFontMetrics();
            for (int i = 0; i < chars.length && i < 4; i++) {  // 最多4个字
                String ch = String.valueOf(chars[i]);
                int charWidth = fm.stringWidth(ch);
                g2d.drawString(ch, centerX - charWidth / 2, startY + i * charHeight + fm.getAscent() / 2);
            }

        } finally {
            g2d.dispose();
        }

        return image;
    }

    /**
     * 绘制环绕文字
     * <p>
     * 按照国家标准：270°范围，自左而右环行，文字头朝外
     * </p>
     *
     * @param g2d         图形上下文
     * @param text        文字内容
     * @param centerX     圆心X坐标
     * @param centerY     圆心Y坐标
     * @param textRadius  文字环绕半径
     * @param color       颜色
     * @param sealRadius  印章半径（用于计算字体大小）
     */
    private void drawCircleText(Graphics2D g2d, String text, int centerX, int centerY,
                                 int textRadius, Color color, int sealRadius) {
        if (text == null || text.isEmpty()) {
            return;
        }

        // 根据印章大小和文字数量计算字体大小
        // 标准: 文字高度约为印章直径的 15-19% (6.5-8mm / 42mm)
        int baseFontSize = (int) (sealRadius * 0.36);  // 基础字号
        int fontSize = text.length() > 14 ? baseFontSize - 4 :
                       text.length() > 10 ? baseFontSize - 2 : baseFontSize;
        fontSize = Math.max(16, Math.min(fontSize, 32));  // 限制范围

        Font font = new Font("宋体", Font.BOLD, fontSize);
        g2d.setFont(font);
        g2d.setColor(color);

        FontRenderContext frc = g2d.getFontRenderContext();
        char[] chars = text.toCharArray();
        int charCount = chars.length;

        /*
         * 标准公章文字布局：
         * - 270°范围，自左而右环行
         * - 起始角度: 225° (左下偏上)
         * - 结束角度: -45° (右下偏上，即315°)
         * - 文字方向: 每个字的顶部朝向圆外（可正常阅读）
         */
        double startAngle = Math.toRadians(225);   // 起始角度 225°
        double endAngle = Math.toRadians(-45);     // 结束角度 -45° (315°)
        double totalAngle = Math.toRadians(270);   // 总角度 270°

        // 计算每个字符的角度间隔（字符间均匀分布）
        double angleStep = totalAngle / (charCount + 1);

        for (int i = 0; i < charCount; i++) {
            // 当前字符的角度位置（顺时针方向）
            double angle = startAngle - angleStep * (i + 1);

            // 计算字符在圆上的位置
            double x = centerX + textRadius * Math.cos(angle);
            double y = centerY - textRadius * Math.sin(angle);

            // 创建字符的变换矩阵
            AffineTransform transform = new AffineTransform();
            transform.translate(x, y);

            // 旋转文字使其头朝外（顶部朝向圆外，底部朝向圆心）
            // 在屏幕坐标系中，文字默认顶部朝上（-Y方向）
            // 需要旋转使顶部朝向圆外方向（即 angle 方向）
            // 旋转角度 = -(angle - π/2) = π/2 - angle
            transform.rotate(Math.PI / 2 - angle);

            // 绘制单个字符
            String ch = String.valueOf(chars[i]);
            GlyphVector gv = font.createGlyphVector(frc, ch);
            Shape shape = gv.getOutline();

            // 居中偏移
            Rectangle bounds = shape.getBounds();
            transform.translate(-bounds.width / 2.0, bounds.height / 2.0);

            g2d.fill(transform.createTransformedShape(shape));
        }
    }

    /**
     * 绘制中心文字（如"合同专用章"）
     *
     * @param g2d        图形上下文
     * @param text       文字内容
     * @param centerX    圆心X坐标
     * @param y          文字Y坐标
     * @param color      颜色
     * @param sealRadius 印章半径（用于计算字体大小）
     */
    private void drawCenterText(Graphics2D g2d, String text, int centerX, int y, Color color, int sealRadius) {
        // 中心文字字号略小于环绕文字
        int fontSize = (int) (sealRadius * 0.28);
        fontSize = Math.max(14, Math.min(fontSize, 24));

        Font font = new Font("宋体", Font.BOLD, fontSize);
        g2d.setFont(font);
        g2d.setColor(color);

        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(text);
        g2d.drawString(text, centerX - textWidth / 2, y);
    }

    /**
     * 绘制五角星
     *
     * @param g2d     图形上下文
     * @param centerX 中心X坐标
     * @param centerY 中心Y坐标
     * @param radius  五角星外接圆半径
     */
    private void drawStar(Graphics2D g2d, int centerX, int centerY, int radius) {
        int[] xPoints = new int[10];
        int[] yPoints = new int[10];
        double innerRadius = radius * 0.4;  // 内接圆半径

        for (int i = 0; i < 10; i++) {
            double angle = Math.PI / 2 + i * Math.PI / 5;  // 从顶部开始
            double r = (i % 2 == 0) ? radius : innerRadius;
            xPoints[i] = (int) (centerX + r * Math.cos(angle));
            yPoints[i] = (int) (centerY - r * Math.sin(angle));
        }

        g2d.fillPolygon(xPoints, yPoints, 10);
    }

    /**
     * 创建透明背景图片
     */
    private BufferedImage createTransparentImage(int width, int height) {
        return new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
    }

    /**
     * 创建图形上下文并设置抗锯齿
     */
    private Graphics2D createGraphics(BufferedImage image) {
        Graphics2D g2d = image.createGraphics();
        // 设置抗锯齿
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        return g2d;
    }

    /**
     * 获取模板，默认使用标准圆形公章
     */
    private SealTemplate getTemplate(String templateCode) {
        if (templateCode == null || templateCode.isEmpty()) {
            return SealTemplate.STANDARD_CIRCLE;
        }
        SealTemplate template = SealTemplate.fromCode(templateCode);
        if (template == null) {
            log.warn("未知的模板代码: {}，使用默认模板", templateCode);
            return SealTemplate.STANDARD_CIRCLE;
        }
        return template;
    }

    /**
     * 解析颜色，默认红色
     */
    private Color parseColor(String colorStr) {
        if (colorStr == null || colorStr.isEmpty()) {
            return DEFAULT_SEAL_COLOR;
        }
        try {
            return Color.decode(colorStr);
        } catch (NumberFormatException e) {
            log.warn("无效的颜色值: {}，使用默认红色", colorStr);
            return DEFAULT_SEAL_COLOR;
        }
    }

    /**
     * 保存图片到文件系统
     */
    private FileUploadResponse saveImage(BufferedImage image, String companyName) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fileName = String.format("seal_%s_%s.png", dateStr,
                UUID.randomUUID().toString().replace("-", "").substring(0, 12));

        String subDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path targetDir = Paths.get(fileUploadConfig.getSealPath(), subDir);

        try {
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            Path targetPath = targetDir.resolve(fileName);
            ImageIO.write(image, "PNG", targetPath.toFile());

            log.info("印章生成成功: {} -> {}", companyName, targetPath);

            String relativePath = subDir + "/" + fileName;
            return FileUploadResponse.builder()
                    .originalName(companyName + "_印章.png")
                    .storedName(fileName)
                    .filePath(targetPath.toString())
                    .fileUrl("/uploads/seals/" + relativePath)
                    .fileSize(Files.size(targetPath))
                    .contentType("image/png")
                    .build();

        } catch (IOException e) {
            log.error("保存印章图片失败: {}", companyName, e);
            throw new BusinessException("印章生成失败，请重试");
        }
    }
}
