package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.config.FileUploadConfig;
import cn.tcxingji.seal.dto.request.ContractSealRequest;
import cn.tcxingji.seal.dto.request.PerforationSealRequest;
import cn.tcxingji.seal.dto.request.SealPositionRequest;
import cn.tcxingji.seal.dto.response.ContractSealResponse;
import cn.tcxingji.seal.dto.response.SealRecordResponse;
import cn.tcxingji.seal.entity.ContractFile;
import cn.tcxingji.seal.entity.PersonalSignature;
import cn.tcxingji.seal.entity.SealInfo;
import cn.tcxingji.seal.entity.SealRecord;
import cn.tcxingji.seal.exception.BusinessException;
import cn.tcxingji.seal.repository.ContractFileRepository;
import cn.tcxingji.seal.repository.PersonalSignatureRepository;
import cn.tcxingji.seal.repository.SealInfoRepository;
import cn.tcxingji.seal.repository.SealRecordRepository;
import cn.tcxingji.seal.service.SealStampService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 盖章服务实现类
 * <p>
 * 使用 PDFBox 3.x 实现 PDF 盖章功能
 * </p>
 *
 * @author TC System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SealStampServiceImpl implements SealStampService {

    private final ContractFileRepository contractFileRepository;
    private final SealInfoRepository sealInfoRepository;
    private final SealRecordRepository sealRecordRepository;
    private final PersonalSignatureRepository personalSignatureRepository;
    private final FileUploadConfig fileUploadConfig;

    @Override
    @Transactional
    public ContractSealResponse stamp(Long contractId, ContractSealRequest request) {
        // 1. 验证合同
        ContractFile contract = findContractOrThrow(contractId);
        validateContractStatus(contract);

        // 2. 验证位置参数
        validatePositions(request.getPositions(), contract.getPageCount());

        // 3. 根据签章类型获取图片路径
        Path imagePath;
        Long recordSealId;
        Integer sealType = request.getSealType() != null ? request.getSealType() : 1;

        if (sealType == SealRecord.SealType.PERSONAL_SIGNATURE) {
            // 个人签名模式
            if (request.getSignatureId() == null) {
                throw new BusinessException("个人签名ID不能为空");
            }
            PersonalSignature signature = findSignatureOrThrow(request.getSignatureId());
            validateSignatureStatus(signature);
            imagePath = getSignatureImagePath(signature);
            recordSealId = signature.getId();
            log.info("使用个人签名: signatureId={}, name={}", signature.getId(), signature.getSignatureName());
        } else {
            // 印章模式（普通章或骑缝章）
            if (request.getSealId() == null) {
                throw new BusinessException("印章ID不能为空");
            }
            SealInfo sealInfo = findSealOrThrow(request.getSealId());
            validateSealStatus(sealInfo);
            imagePath = getSealImagePath(sealInfo);
            recordSealId = sealInfo.getId();
            log.info("使用印章: sealId={}, name={}", sealInfo.getId(), sealInfo.getSealName());
        }

        // 4. 执行盖章
        Path signedPath = doStampWithImage(contract, imagePath, request.getPositions());

        // 5. 保存签章记录
        List<SealRecord> records = saveSealRecordsWithType(contract, recordSealId, request);

        // 6. 更新合同状态
        updateContractSigned(contract, signedPath);

        log.info("盖章成功: contractId={}, sealType={}, positions={}",
                contractId, sealType, request.getPositions().size());

        return buildResponse(contract, signedPath, records);
    }

    @Override
    @Transactional
    public ContractSealResponse batchStamp(Long contractId, List<ContractSealRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new BusinessException("盖章请求不能为空");
        }

        // 1. 验证合同
        ContractFile contract = findContractOrThrow(contractId);
        validateContractStatus(contract);

        // 2. 加载源 PDF
        Path sourcePath = Paths.get(contract.getOriginalPath());
        if (!Files.exists(sourcePath)) {
            throw new BusinessException("合同文件不存在");
        }

        List<SealRecord> allRecords = new ArrayList<>();
        Path finalSignedPath = null;

        try (PDDocument document = Loader.loadPDF(sourcePath.toFile())) {
            // 3. 依次处理每个盖章请求
            for (ContractSealRequest request : requests) {
                SealInfo sealInfo = findSealOrThrow(request.getSealId());
                validateSealStatus(sealInfo);
                validatePositions(request.getPositions(), contract.getPageCount());

                // 在文档上盖章
                stampOnDocument(document, sealInfo, request.getPositions());

                // 保存签章记录
                List<SealRecord> records = saveSealRecords(contract, sealInfo, request);
                allRecords.addAll(records);
            }

            // 4. 保存签章后文件
            finalSignedPath = saveSignedDocument(document, contract);

        } catch (IOException e) {
            log.error("批量盖章失败: contractId={}", contractId, e);
            throw new BusinessException("盖章处理失败: " + e.getMessage());
        }

        // 5. 更新合同状态
        updateContractSigned(contract, finalSignedPath);

        log.info("批量盖章成功: contractId={}, 印章数={}, 位置总数={}",
                contractId, requests.size(), allRecords.size());

        return buildResponse(contract, finalSignedPath, allRecords);
    }

    @Override
    public List<SealRecordResponse> getRecords(Long contractId) {
        List<SealRecord> records = sealRecordRepository.findByContractId(contractId);
        return records.stream()
                .map(SealRecordResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public ContractSealResponse perforationStamp(Long contractId, PerforationSealRequest request) {
        // 1. 验证合同
        ContractFile contract = findContractOrThrow(contractId);
        validateContractStatus(contract);

        // 2. 验证印章
        SealInfo sealInfo = findSealOrThrow(request.getSealId());
        validateSealStatus(sealInfo);

        // 3. 加载源 PDF
        Path sourcePath = Paths.get(contract.getOriginalPath());
        if (!Files.exists(sourcePath)) {
            throw new BusinessException("合同文件不存在");
        }

        List<SealRecord> records = new ArrayList<>();
        Path signedPath;

        try (PDDocument document = Loader.loadPDF(sourcePath.toFile())) {
            int totalPages = document.getNumberOfPages();
            if (totalPages < 2) {
                throw new BusinessException("骑缝章需要至少2页的PDF文档");
            }

            // 4. 加载印章图片
            Path sealImagePath = getSealImagePath(sealInfo);
            if (!Files.exists(sealImagePath)) {
                throw new BusinessException("印章图片不存在: " + sealInfo.getSealName());
            }
            BufferedImage sealImage = ImageIO.read(sealImagePath.toFile());

            // 5. 计算每页印章切片高度
            float sealWidth = request.getSealWidth().floatValue();
            float sealHeight = request.getSealHeight().floatValue();
            float sliceHeight = sealHeight / totalPages;

            // 印章图片的每切片像素高度
            int imgSliceHeight = sealImage.getHeight() / totalPages;

            LocalDateTime now = LocalDateTime.now();

            // 6. 为每页绘制印章切片
            for (int i = 0; i < totalPages; i++) {
                PDPage page = document.getPage(i);
                PDRectangle mediaBox = page.getMediaBox();

                // 切割印章图片
                int srcY = i * imgSliceHeight;
                int srcHeight = Math.min(imgSliceHeight, sealImage.getHeight() - srcY);
                BufferedImage sliceImage = sealImage.getSubimage(
                        0, srcY,
                        sealImage.getWidth(), srcHeight
                );

                // 转换为 PDImageXObject
                PDImageXObject pdSlice = LosslessFactory.createFromImage(document, sliceImage);

                // 计算位置：右边缘居中
                float edgeMargin = request.getEdgeMargin() != null
                        ? request.getEdgeMargin().floatValue()
                        : sealWidth / 2;  // 默认一半在页面内
                float x = mediaBox.getWidth() - edgeMargin;
                float yOffset = request.getYOffset().floatValue();
                // 居中位置 + 偏移
                float y = (mediaBox.getHeight() - sliceHeight) / 2 + yOffset;

                // 绘制印章切片
                try (PDPageContentStream contentStream = new PDPageContentStream(
                        document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.drawImage(pdSlice, x, y, sealWidth, sliceHeight);
                }

                log.debug("绘制骑缝章切片: page={}, x={}, y={}, slice={}/{}",
                        i + 1, x, y, i + 1, totalPages);

                // 保存签章记录
                SealRecord record = SealRecord.builder()
                        .contractId(contract.getId())
                        .sealId(sealInfo.getId())
                        .pageNumber(i + 1)
                        .positionX(BigDecimal.valueOf(x))
                        .positionY(BigDecimal.valueOf(y))
                        .sealWidth(request.getSealWidth())
                        .sealHeight(BigDecimal.valueOf(sliceHeight))
                        .sealType(SealRecord.SealType.PERFORATION)
                        .operatorId(request.getOperatorId())
                        .operatorName(request.getOperatorName())
                        .sealTime(now)
                        .build();
                records.add(sealRecordRepository.save(record));
            }

            // 7. 保存签章后文件
            signedPath = saveSignedDocument(document, contract);

        } catch (IOException e) {
            log.error("骑缝章处理失败: contractId={}", contractId, e);
            throw new BusinessException("骑缝章处理失败: " + e.getMessage());
        }

        // 8. 更新合同状态
        updateContractSigned(contract, signedPath);

        log.info("骑缝章盖章成功: contractId={}, sealId={}, pages={}",
                contractId, request.getSealId(), records.size());

        return buildResponse(contract, signedPath, records);
    }

    // ==================== 核心盖章逻辑 ====================

    /**
     * 执行单次盖章操作
     *
     * @param contract  合同文件
     * @param sealInfo  印章信息
     * @param positions 盖章位置列表
     * @return 签章后文件路径
     */
    private Path doStamp(ContractFile contract, SealInfo sealInfo,
                          List<SealPositionRequest> positions) {
        // 优先使用已签章的 PDF，支持多次签章累加
        String pathToUse = (contract.getSignedPath() != null && !contract.getSignedPath().isEmpty())
                ? contract.getSignedPath()
                : contract.getOriginalPath();
        Path sourcePath = Paths.get(pathToUse);
        if (!Files.exists(sourcePath)) {
            throw new BusinessException("合同文件不存在");
        }

        try (PDDocument document = Loader.loadPDF(sourcePath.toFile())) {
            stampOnDocument(document, sealInfo, positions);
            return saveSignedDocument(document, contract);
        } catch (IOException e) {
            log.error("盖章处理失败: contractId={}", contract.getId(), e);
            throw new BusinessException("盖章处理失败: " + e.getMessage());
        }
    }

    /**
     * 在 PDF 文档上绘制印章
     *
     * @param document  PDF 文档
     * @param sealInfo  印章信息
     * @param positions 盖章位置列表
     */
    private void stampOnDocument(PDDocument document, SealInfo sealInfo,
                                  List<SealPositionRequest> positions) throws IOException {
        // 获取印章图片路径
        Path sealImagePath = getSealImagePath(sealInfo);
        if (!Files.exists(sealImagePath)) {
            throw new BusinessException("印章图片不存在: " + sealInfo.getSealName());
        }

        // 加载印章图片
        PDImageXObject sealImage = PDImageXObject.createFromFile(
                sealImagePath.toString(), document);

        // 在每个位置绘制印章
        for (SealPositionRequest position : positions) {
            int pageIndex = position.getPageNumber() - 1;  // 转为0索引
            PDPage page = document.getPage(pageIndex);

            // 使用 APPEND 模式添加内容，保留原有内容
            try (PDPageContentStream contentStream = new PDPageContentStream(
                    document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                float x = position.getX().floatValue();
                float y = position.getY().floatValue();
                float width = position.getWidth().floatValue();
                float height = position.getHeight().floatValue();

                // 绘制印章图片
                contentStream.drawImage(sealImage, x, y, width, height);

                log.debug("绘制印章: page={}, x={}, y={}, w={}, h={}",
                        position.getPageNumber(), x, y, width, height);
            }
        }
    }

    /**
     * 保存签章后的文档
     *
     * @param document PDF 文档
     * @param contract 合同文件
     * @return 签章后文件路径
     */
    private Path saveSignedDocument(PDDocument document, ContractFile contract)
            throws IOException {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String fileName = String.format("signed_%s_%s.pdf",
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                UUID.randomUUID().toString().replace("-", "").substring(0, 12));

        Path targetDir = Paths.get(fileUploadConfig.getContractPath(), "signed", dateStr);
        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        Path signedPath = targetDir.resolve(fileName);
        document.save(signedPath.toFile());

        log.info("保存签章后文件: {}", signedPath);
        return signedPath;
    }

    // ==================== 辅助方法 ====================

    /**
     * 获取印章图片绝对路径
     */
    private Path getSealImagePath(SealInfo sealInfo) {
        String sealImage = sealInfo.getSealImage();
        // 如果是相对路径（以 /uploads 开头），转为绝对路径
        if (sealImage.startsWith("/uploads/seals/")) {
            String relativePath = sealImage.substring("/uploads/seals/".length());
            return Paths.get(fileUploadConfig.getSealPath(), relativePath);
        }
        // 否则直接使用
        return Paths.get(sealImage);
    }

    /**
     * 保存签章记录
     */
    private List<SealRecord> saveSealRecords(ContractFile contract, SealInfo sealInfo,
                                              ContractSealRequest request) {
        List<SealRecord> records = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (SealPositionRequest position : request.getPositions()) {
            SealRecord record = SealRecord.builder()
                    .contractId(contract.getId())
                    .sealId(sealInfo.getId())
                    .pageNumber(position.getPageNumber())
                    .positionX(position.getX())
                    .positionY(position.getY())
                    .sealWidth(position.getWidth())
                    .sealHeight(position.getHeight())
                    .sealType(request.getSealType())
                    .operatorId(request.getOperatorId())
                    .operatorName(request.getOperatorName())
                    .sealTime(now)
                    .build();

            records.add(sealRecordRepository.save(record));
        }

        return records;
    }

    /**
     * 更新合同为已签章状态
     */
    private void updateContractSigned(ContractFile contract, Path signedPath) {
        contract.setSignedPath(signedPath.toString());
        contract.setStatus(ContractFile.Status.SIGNED);
        contractFileRepository.save(contract);

        // 清理旧的签章后预览图缓存，确保下次预览时重新生成
        clearSignedPreviewCache(contract.getId());
    }

    /**
     * 清理签章后预览图缓存
     * <p>
     * 每次重新签章后，需要清理旧的预览图缓存，确保显示最新的签章效果
     * </p>
     */
    private void clearSignedPreviewCache(Long contractId) {
        String previewDir = String.format("%s/preview/%d/signed",
                fileUploadConfig.getContractPath(), contractId);
        Path previewPath = Paths.get(previewDir);

        if (Files.exists(previewPath)) {
            try {
                // 删除目录下所有预览图文件
                Files.list(previewPath)
                        .filter(Files::isRegularFile)
                        .forEach(file -> {
                            try {
                                Files.delete(file);
                                log.debug("删除旧预览图: {}", file);
                            } catch (IOException e) {
                                log.warn("删除预览图失败: {}", file, e);
                            }
                        });
                log.info("清理签章预览图缓存: contractId={}", contractId);
            } catch (IOException e) {
                log.warn("清理预览图缓存失败: contractId={}", contractId, e);
            }
        }
    }

    /**
     * 构建响应
     */
    private ContractSealResponse buildResponse(ContractFile contract, Path signedPath,
                                                List<SealRecord> records) {
        String signedUrl = "/uploads/contracts/signed/" + extractRelativePath(signedPath);

        List<SealRecordResponse> recordResponses = records.stream()
                .map(SealRecordResponse::fromEntity)
                .toList();

        return ContractSealResponse.builder()
                .contractId(contract.getId())
                .signedFileUrl(signedUrl)
                .signedFilePath(signedPath.toString())
                .sealRecords(recordResponses)
                .sealCount(records.size())
                .message("盖章成功")
                .build();
    }

    /**
     * 提取相对路径
     */
    private String extractRelativePath(Path path) {
        String pathStr = path.toString();
        int idx = pathStr.indexOf("signed");
        if (idx >= 0) {
            return pathStr.substring(idx + "signed/".length());
        }
        return path.getFileName().toString();
    }

    // ==================== 验证方法 ====================

    private ContractFile findContractOrThrow(Long contractId) {
        return contractFileRepository.findById(contractId)
                .orElseThrow(() -> new BusinessException("合同不存在: " + contractId));
    }

    private SealInfo findSealOrThrow(Long sealId) {
        return sealInfoRepository.findById(sealId)
                .orElseThrow(() -> new BusinessException("印章不存在: " + sealId));
    }

    private void validateContractStatus(ContractFile contract) {
        if (contract.getStatus() == ContractFile.Status.CANCELLED) {
            throw new BusinessException("合同已作废，无法盖章");
        }
    }

    private void validateSealStatus(SealInfo sealInfo) {
        if (sealInfo.getStatus() != SealInfo.Status.ENABLED) {
            throw new BusinessException("印章已禁用: " + sealInfo.getSealName());
        }
    }

    private PersonalSignature findSignatureOrThrow(Long signatureId) {
        return personalSignatureRepository.findById(signatureId)
                .orElseThrow(() -> new BusinessException("个人签名不存在: " + signatureId));
    }

    private void validateSignatureStatus(PersonalSignature signature) {
        if (signature.getStatus() != PersonalSignature.Status.ENABLED) {
            throw new BusinessException("个人签名已禁用: " + signature.getSignatureName());
        }
    }

    /**
     * 获取个人签名图片绝对路径
     */
    private Path getSignatureImagePath(PersonalSignature signature) {
        String signatureImage = signature.getSignatureImage();
        // 如果是相对路径（以 /uploads 开头），转为绝对路径
        if (signatureImage.startsWith("/uploads/signatures/")) {
            String relativePath = signatureImage.substring("/uploads/signatures/".length());
            return Paths.get(fileUploadConfig.getSignaturePath(), relativePath);
        }
        // 否则直接使用
        return Paths.get(signatureImage);
    }

    /**
     * 使用图片路径执行盖章
     *
     * @param contract  合同文件
     * @param imagePath 图片路径（印章或签名）
     * @param positions 盖章位置列表
     * @return 签章后文件路径
     */
    private Path doStampWithImage(ContractFile contract, Path imagePath,
                                   List<SealPositionRequest> positions) {
        // 优先使用已签章的 PDF，支持多次签章累加
        String pathToUse = (contract.getSignedPath() != null && !contract.getSignedPath().isEmpty())
                ? contract.getSignedPath()
                : contract.getOriginalPath();
        Path sourcePath = Paths.get(pathToUse);
        if (!Files.exists(sourcePath)) {
            throw new BusinessException("合同文件不存在");
        }

        if (!Files.exists(imagePath)) {
            throw new BusinessException("图片文件不存在: " + imagePath);
        }

        try (PDDocument document = Loader.loadPDF(sourcePath.toFile())) {
            stampOnDocumentWithImage(document, imagePath, positions);
            return saveSignedDocument(document, contract);
        } catch (IOException e) {
            log.error("盖章处理失败: contractId={}", contract.getId(), e);
            throw new BusinessException("盖章处理失败: " + e.getMessage());
        }
    }

    /**
     * 在 PDF 文档上绘制图片（印章或签名）
     *
     * @param document  PDF 文档
     * @param imagePath 图片路径
     * @param positions 盖章位置列表
     */
    private void stampOnDocumentWithImage(PDDocument document, Path imagePath,
                                           List<SealPositionRequest> positions) throws IOException {
        // 加载图片
        PDImageXObject image = PDImageXObject.createFromFile(imagePath.toString(), document);

        // 在每个位置绘制图片
        for (SealPositionRequest position : positions) {
            int pageIndex = position.getPageNumber() - 1;  // 转为0索引
            PDPage page = document.getPage(pageIndex);

            // 使用 APPEND 模式添加内容，保留原有内容
            try (PDPageContentStream contentStream = new PDPageContentStream(
                    document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                float x = position.getX().floatValue();
                float y = position.getY().floatValue();
                float width = position.getWidth().floatValue();
                float height = position.getHeight().floatValue();

                // 绘制图片
                contentStream.drawImage(image, x, y, width, height);

                log.debug("绘制图片: page={}, x={}, y={}, w={}, h={}",
                        position.getPageNumber(), x, y, width, height);
            }
        }
    }

    /**
     * 保存签章记录（支持印章和签名）
     */
    private List<SealRecord> saveSealRecordsWithType(ContractFile contract, Long sealOrSignatureId,
                                                      ContractSealRequest request) {
        List<SealRecord> records = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (SealPositionRequest position : request.getPositions()) {
            SealRecord record = SealRecord.builder()
                    .contractId(contract.getId())
                    .sealId(sealOrSignatureId)  // 印章ID或签名ID
                    .pageNumber(position.getPageNumber())
                    .positionX(position.getX())
                    .positionY(position.getY())
                    .sealWidth(position.getWidth())
                    .sealHeight(position.getHeight())
                    .sealType(request.getSealType())
                    .operatorId(request.getOperatorId())
                    .operatorName(request.getOperatorName())
                    .sealTime(now)
                    .build();

            records.add(sealRecordRepository.save(record));
        }

        return records;
    }

    private void validatePositions(List<SealPositionRequest> positions, Integer pageCount) {
        for (SealPositionRequest position : positions) {
            if (position.getPageNumber() > pageCount) {
                throw new BusinessException(
                        String.format("页码超出范围: %d (总页数: %d)",
                                position.getPageNumber(), pageCount));
            }
        }
    }
}
