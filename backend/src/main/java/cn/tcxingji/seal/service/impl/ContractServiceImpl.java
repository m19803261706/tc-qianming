package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.config.FileUploadConfig;
import cn.tcxingji.seal.dto.request.ContractQueryRequest;
import cn.tcxingji.seal.dto.request.ContractUploadRequest;
import cn.tcxingji.seal.dto.response.ContractPreviewResponse;
import cn.tcxingji.seal.dto.response.ContractResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.entity.ContractFile;
import cn.tcxingji.seal.exception.BusinessException;
import cn.tcxingji.seal.repository.ContractFileRepository;
import cn.tcxingji.seal.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

/**
 * 合同服务实现类
 * <p>
 * 使用 PDFBox 3.x 处理 PDF 文件
 * </p>
 *
 * @author TC System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractFileRepository contractFileRepository;
    private final FileUploadConfig fileUploadConfig;

    /**
     * 允许的文件类型
     */
    private static final String[] ALLOWED_TYPES = {"application/pdf"};

    /**
     * 最大文件大小（50MB）
     */
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * 预览图 DPI
     */
    private static final float PREVIEW_DPI = 150f;

    /**
     * 预览生成结果（内部类）
     * 包含预览图 URL、PDF 尺寸和图片尺寸信息
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    private static class PreviewResult {
        /** 预览图 URL 列表 */
        private List<String> previewUrls;
        /** PDF 页面宽度（pt） */
        private float pdfWidth;
        /** PDF 页面高度（pt） */
        private float pdfHeight;
        /** 预览图片宽度（像素） */
        private int imageWidth;
        /** 预览图片高度（像素） */
        private int imageHeight;
    }

    @Override
    @Transactional
    public ContractResponse upload(MultipartFile file, ContractUploadRequest request) {
        // 1. 验证文件
        validateFile(file);

        // 2. 获取文件字节数组（只读取一次，避免流被消耗后无法重复读取）
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            log.error("读取文件内容失败", e);
            throw new BusinessException("读取文件内容失败，请重试");
        }

        // 3. 计算文件哈希
        String fileHash = calculateHash(fileBytes);

        // 4. 检查文件是否已存在
        if (contractFileRepository.existsByFileHash(fileHash)) {
            throw new BusinessException("该文件已上传过，请勿重复上传");
        }

        // 5. 保存文件
        String originalName = file.getOriginalFilename();
        Path savedPath = saveFile(fileBytes);

        // 6. 读取 PDF 页数
        int pageCount = getPdfPageCount(savedPath);

        // 7. 创建数据库记录
        // 如果用户没有填写合同名称，则使用原始文件名（去掉扩展名）
        String contractName = request.getContractName();
        if (contractName == null || contractName.isBlank()) {
            // 去掉 .pdf 扩展名作为默认名称
            contractName = originalName != null && originalName.toLowerCase().endsWith(".pdf")
                    ? originalName.substring(0, originalName.length() - 4)
                    : originalName;
        }

        ContractFile contractFile = ContractFile.builder()
                .contractName(contractName)
                .fileName(originalName)
                .originalPath(savedPath.toString())
                .fileSize(file.getSize())
                .pageCount(pageCount)
                .fileHash(fileHash)
                .status(ContractFile.Status.PENDING)
                .ownerId(request.getOwnerId())
                .ownerType(request.getOwnerType())
                .remark(request.getRemark())
                .build();

        contractFile = contractFileRepository.save(contractFile);
        log.info("合同文件上传成功: id={}, fileName={}, pageCount={}",
                contractFile.getId(), originalName, pageCount);

        return ContractResponse.fromEntity(contractFile);
    }

    @Override
    public ContractResponse getById(Long id) {
        ContractFile contractFile = findContractOrThrow(id);
        return ContractResponse.fromEntity(contractFile);
    }

    @Override
    public PageResponse<ContractResponse> queryPage(ContractQueryRequest request) {
        PageRequest pageRequest = PageRequest.of(
                request.getPage() - 1,
                request.getSize(),
                Sort.by(Sort.Direction.DESC, "createTime")
        );

        Page<ContractFile> page;

        // 获取搜索关键词（优先使用 keyword，兼容旧的 fileName 参数）
        String keyword = request.getKeyword();
        if ((keyword == null || keyword.isEmpty()) && request.getFileName() != null) {
            keyword = request.getFileName();
        }
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();

        if (hasKeyword && request.getStatus() != null) {
            // 按关键词 + 状态搜索
            page = contractFileRepository.searchByKeywordAndStatus(
                    keyword.trim(),
                    request.getStatus(),
                    pageRequest
            );
        } else if (hasKeyword) {
            // 仅按关键词搜索（匹配合同名称或文件名）
            page = contractFileRepository.searchByKeyword(keyword.trim(), pageRequest);
        } else if (request.getStatus() != null) {
            // 仅按状态筛选
            page = contractFileRepository.findByStatus(request.getStatus(), pageRequest);
        } else if (request.getOwnerId() != null && request.getOwnerType() != null) {
            // 按所有者查询
            page = contractFileRepository.findByOwnerIdAndOwnerType(
                    request.getOwnerId(),
                    request.getOwnerType(),
                    pageRequest
            );
        } else {
            // 全量分页查询
            page = contractFileRepository.findAll(pageRequest);
        }

        List<ContractResponse> content = page.getContent().stream()
                .map(ContractResponse::fromEntity)
                .toList();

        return PageResponse.<ContractResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Override
    public List<ContractResponse> listByOwner(Long ownerId, Integer ownerType) {
        List<ContractFile> contracts = contractFileRepository
                .findByOwnerIdAndOwnerType(ownerId, ownerType);
        return contracts.stream()
                .map(ContractResponse::fromEntity)
                .toList();
    }

    @Override
    public ContractPreviewResponse preview(Long id) {
        ContractFile contractFile = findContractOrThrow(id);

        // 优先使用签章后的 PDF，否则使用原始 PDF
        boolean isSigned = contractFile.getSignedPath() != null && !contractFile.getSignedPath().isEmpty();
        String pathToUse = isSigned ? contractFile.getSignedPath() : contractFile.getOriginalPath();
        Path pdfPath = Paths.get(pathToUse);

        if (!Files.exists(pdfPath)) {
            throw new BusinessException("PDF 文件不存在");
        }

        // 生成所有页的预览图（签章后使用不同的子目录）
        PreviewResult result = generatePreviewImages(contractFile, pdfPath, -1, isSigned);

        return ContractPreviewResponse.builder()
                .contractId(id)
                .fileName(contractFile.getFileName())
                .totalPages(contractFile.getPageCount())
                .currentPage(1)
                .previewUrls(result.getPreviewUrls())
                .width(result.getImageWidth())
                .height(result.getImageHeight())
                .pdfWidth(result.getPdfWidth())
                .pdfHeight(result.getPdfHeight())
                .build();
    }

    @Override
    public ContractPreviewResponse previewPage(Long id, int page) {
        ContractFile contractFile = findContractOrThrow(id);

        // 优先使用签章后的 PDF，否则使用原始 PDF
        boolean isSigned = contractFile.getSignedPath() != null && !contractFile.getSignedPath().isEmpty();
        String pathToUse = isSigned ? contractFile.getSignedPath() : contractFile.getOriginalPath();
        Path pdfPath = Paths.get(pathToUse);

        if (!Files.exists(pdfPath)) {
            throw new BusinessException("PDF 文件不存在");
        }

        if (page < 1 || page > contractFile.getPageCount()) {
            throw new BusinessException("页码超出范围，总页数: " + contractFile.getPageCount());
        }

        // 生成单页预览图（签章后使用不同的子目录）
        PreviewResult result = generatePreviewImages(contractFile, pdfPath, page, isSigned);

        return ContractPreviewResponse.builder()
                .contractId(id)
                .fileName(contractFile.getFileName())
                .totalPages(contractFile.getPageCount())
                .currentPage(page)
                .previewUrl(result.getPreviewUrls().isEmpty() ? null : result.getPreviewUrls().get(0))
                .previewUrls(result.getPreviewUrls())
                .width(result.getImageWidth())
                .height(result.getImageHeight())
                .pdfWidth(result.getPdfWidth())
                .pdfHeight(result.getPdfHeight())
                .build();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ContractFile contractFile = findContractOrThrow(id);

        // 删除物理文件
        deletePhysicalFile(contractFile.getOriginalPath());
        if (contractFile.getSignedPath() != null) {
            deletePhysicalFile(contractFile.getSignedPath());
        }

        // 删除数据库记录
        contractFileRepository.delete(contractFile);
        log.info("合同文件删除成功: id={}, fileName={}", id, contractFile.getFileName());
    }

    @Override
    @Transactional
    public ContractResponse updateStatus(Long id, Integer status) {
        ContractFile contractFile = findContractOrThrow(id);
        contractFile.setStatus(status);
        contractFile = contractFileRepository.save(contractFile);
        log.info("合同状态更新: id={}, status={}", id, status);
        return ContractResponse.fromEntity(contractFile);
    }

    @Override
    public Resource download(Long id, boolean downloadSigned) {
        ContractFile contractFile = findContractOrThrow(id);

        // 确定要下载的文件路径
        String pathToUse;
        if (downloadSigned && contractFile.getSignedPath() != null && !contractFile.getSignedPath().isEmpty()) {
            pathToUse = contractFile.getSignedPath();
        } else {
            pathToUse = contractFile.getOriginalPath();
        }

        Path filePath = Paths.get(pathToUse);
        if (!Files.exists(filePath)) {
            throw new BusinessException("文件不存在: " + pathToUse);
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                log.info("下载合同: id={}, path={}", id, pathToUse);
                return resource;
            } else {
                throw new BusinessException("无法读取文件: " + pathToUse);
            }
        } catch (MalformedURLException e) {
            log.error("文件路径错误: {}", pathToUse, e);
            throw new BusinessException("文件路径错误: " + e.getMessage());
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 验证上传文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的文件");
        }

        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("文件大小不能超过 50MB");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        boolean isValidType = false;
        for (String allowedType : ALLOWED_TYPES) {
            if (allowedType.equals(contentType)) {
                isValidType = true;
                break;
            }
        }
        if (!isValidType) {
            throw new BusinessException("仅支持 PDF 格式文件");
        }

        // 验证文件扩展名
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new BusinessException("文件扩展名必须为 .pdf");
        }
    }

    /**
     * 计算字节数组的 SHA-256 哈希值
     */
    private String calculateHash(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fileBytes);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException("计算文件哈希失败: " + e.getMessage());
        }
    }

    /**
     * 保存文件到磁盘
     * 注意：使用 file.getBytes() 写入文件，因为流可能在 calculateHash() 中已被读取
     */
    private Path saveFile(byte[] fileBytes) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String fileName = String.format("contract_%s_%s.pdf",
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                UUID.randomUUID().toString().replace("-", "").substring(0, 12));

        Path targetDir = Paths.get(fileUploadConfig.getContractPath(), dateStr);

        try {
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            Path targetPath = targetDir.resolve(fileName);
            Files.write(targetPath, fileBytes);
            log.debug("文件保存成功: {}", targetPath);
            return targetPath;

        } catch (IOException e) {
            log.error("保存文件失败", e);
            throw new BusinessException("文件保存失败，请重试");
        }
    }

    /**
     * 使用 PDFBox 3.x 读取 PDF 页数
     */
    private int getPdfPageCount(Path pdfPath) {
        try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {
            int pageCount = document.getNumberOfPages();
            log.debug("PDF 页数: {}", pageCount);
            return pageCount;
        } catch (IOException e) {
            log.error("读取 PDF 页数失败: {}", pdfPath, e);
            throw new BusinessException("无法读取 PDF 文件，请确认文件格式正确");
        }
    }

    /**
     * 生成 PDF 预览图片
     *
     * @param contractFile 合同文件
     * @param pdfPath      PDF 路径
     * @param targetPage   目标页码（-1 表示所有页）
     * @param isSigned     是否为签章后的 PDF（签章后使用不同的子目录）
     * @return 预览结果（包含 URL 列表、PDF 尺寸和图片尺寸）
     */
    private PreviewResult generatePreviewImages(ContractFile contractFile, Path pdfPath, int targetPage, boolean isSigned) {
        List<String> previewUrls = new ArrayList<>();
        float pdfWidth = 595f;  // 默认 A4 宽度
        float pdfHeight = 842f; // 默认 A4 高度
        int imageWidth = 0;
        int imageHeight = 0;

        // 预览图存储目录（签章后使用 signed 子目录）
        String subDir = isSigned ? "signed" : "original";
        String previewDir = String.format("%s/preview/%d/%s",
                fileUploadConfig.getContractPath(), contractFile.getId(), subDir);

        try {
            Path previewPath = Paths.get(previewDir);
            if (!Files.exists(previewPath)) {
                Files.createDirectories(previewPath);
            }

            try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {
                PDFRenderer renderer = new PDFRenderer(document);
                int pageCount = document.getNumberOfPages();

                int startPage = targetPage > 0 ? targetPage - 1 : 0;
                int endPage = targetPage > 0 ? targetPage : pageCount;

                // 获取第一页的 PDF 实际尺寸（用于坐标转换）
                if (pageCount > 0) {
                    PDPage firstPage = document.getPage(startPage);
                    PDRectangle mediaBox = firstPage.getMediaBox();
                    pdfWidth = mediaBox.getWidth();
                    pdfHeight = mediaBox.getHeight();
                    log.debug("PDF 实际尺寸: width={} pt, height={} pt", pdfWidth, pdfHeight);
                }

                for (int i = startPage; i < endPage; i++) {
                    String imageName = String.format("page_%d.png", i + 1);
                    Path imagePath = previewPath.resolve(imageName);

                    BufferedImage image;
                    // 如果预览图已存在，读取它获取尺寸；否则生成新的
                    if (Files.exists(imagePath)) {
                        image = ImageIO.read(imagePath.toFile());
                    } else {
                        image = renderer.renderImageWithDPI(i, PREVIEW_DPI, ImageType.RGB);
                        ImageIO.write(image, "PNG", imagePath.toFile());
                        log.debug("生成预览图: {}", imagePath);
                    }

                    // 记录第一张图片的尺寸
                    if (i == startPage && image != null) {
                        imageWidth = image.getWidth();
                        imageHeight = image.getHeight();
                        log.debug("预览图尺寸: width={} px, height={} px", imageWidth, imageHeight);
                    }

                    String url = String.format("/uploads/contracts/preview/%d/%s/%s",
                            contractFile.getId(), subDir, imageName);
                    previewUrls.add(url);
                }
            }

        } catch (IOException e) {
            log.error("生成预览图失败: contractId={}", contractFile.getId(), e);
            throw new BusinessException("生成预览图失败，请重试");
        }

        return new PreviewResult(previewUrls, pdfWidth, pdfHeight, imageWidth, imageHeight);
    }

    /**
     * 查找合同或抛出异常
     */
    private ContractFile findContractOrThrow(Long id) {
        return contractFileRepository.findById(id)
                .orElseThrow(() -> new BusinessException("合同不存在: " + id));
    }

    /**
     * 删除物理文件
     */
    private void deletePhysicalFile(String path) {
        if (path == null || path.isEmpty()) {
            return;
        }
        try {
            Path filePath = Paths.get(path);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.debug("删除文件: {}", path);
            }
        } catch (IOException e) {
            log.warn("删除文件失败: {}", path, e);
        }
    }
}
