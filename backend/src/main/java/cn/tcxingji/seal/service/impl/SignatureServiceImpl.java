package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.dto.request.SignatureCreateRequest;
import cn.tcxingji.seal.dto.request.SignatureQueryRequest;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SignatureResponse;
import cn.tcxingji.seal.entity.PersonalSignature;
import cn.tcxingji.seal.repository.PersonalSignatureRepository;
import cn.tcxingji.seal.service.SignatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 个人签名服务实现类
 * <p>
 * 提供个人签名的增删改查等业务功能实现
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SignatureServiceImpl implements SignatureService {

    private final PersonalSignatureRepository signatureRepository;

    /**
     * 文件访问基础URL
     */
    @Value("${file.upload.base-url:}")
    private String baseUrl;

    @Override
    @Transactional
    public SignatureResponse create(SignatureCreateRequest request) {
        log.info("创建签名: userId={}, signatureType={}", request.getUserId(), request.getSignatureType());

        // 构建实体
        PersonalSignature signature = PersonalSignature.builder()
                .userId(request.getUserId())
                .signatureName(request.getSignatureName())
                .signatureImage(request.getSignatureImage())
                .signatureType(request.getSignatureType())
                .fontName(request.getFontName())
                .fontColor(request.getFontColor())
                .textContent(request.getTextContent())
                .isDefault(request.getIsDefault())
                .status(PersonalSignature.Status.ENABLED)
                .createBy(request.getCreateBy())
                .build();

        // 如果设为默认签名，先取消该用户其他默认签名
        if (signature.isDefaultSignature()) {
            signatureRepository.clearDefaultSignature(request.getUserId());
        }

        // 保存实体
        PersonalSignature saved = signatureRepository.save(signature);
        log.info("签名创建成功: id={}", saved.getId());

        return toResponse(saved);
    }

    @Override
    public SignatureResponse getById(Long id) {
        log.debug("获取签名详情: id={}", id);

        PersonalSignature signature = signatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("签名不存在: id=" + id));

        return toResponse(signature);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("删除签名: id={}", id);

        PersonalSignature signature = signatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("签名不存在: id=" + id));

        signatureRepository.delete(signature);
        log.info("签名删除成功: id={}", id);
    }

    @Override
    @Transactional
    public SignatureResponse setDefault(Long id, Long userId) {
        log.info("设置默认签名: id={}, userId={}", id, userId);

        // 验证签名存在且属于该用户
        PersonalSignature signature = signatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("签名不存在: id=" + id));

        if (!signature.getUserId().equals(userId)) {
            throw new RuntimeException("签名不属于该用户");
        }

        // 使用 Repository 的批量更新方法（原子操作）
        signatureRepository.setDefaultSignature(id, userId);

        // 重新加载实体
        signature = signatureRepository.findById(id).orElseThrow();
        log.info("设置默认签名成功: id={}", id);

        return toResponse(signature);
    }

    @Override
    public List<SignatureResponse> listByUserId(Long userId) {
        log.debug("获取用户签名列表: userId={}", userId);

        List<PersonalSignature> signatures = signatureRepository.findByUserId(userId);
        return signatures.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<SignatureResponse> listEnabledByUserId(Long userId) {
        log.debug("获取用户启用签名列表: userId={}", userId);

        List<PersonalSignature> signatures = signatureRepository.findEnabledSignatures(userId);
        return signatures.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SignatureResponse getDefaultByUserId(Long userId) {
        log.debug("获取用户默认签名: userId={}", userId);

        return signatureRepository.findDefaultSignature(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    public PageResponse<SignatureResponse> queryPage(SignatureQueryRequest request) {
        log.debug("分页查询签名: userId={}, page={}, size={}",
                request.getUserId(), request.getPage(), request.getSize());

        // 构建分页参数（页码从1转换为0）
        Pageable pageable = PageRequest.of(
                request.getPage() - 1,
                request.getSize(),
                Sort.by(Sort.Direction.DESC, "isDefault", "createTime")
        );

        Page<PersonalSignature> page;

        // 根据查询条件选择查询方法
        if (request.getUserId() != null) {
            if (request.getStatus() != null) {
                page = signatureRepository.findByUserIdAndStatus(request.getUserId(), request.getStatus(), pageable);
            } else {
                page = signatureRepository.findByUserId(request.getUserId(), pageable);
            }
        } else {
            page = signatureRepository.findAll(pageable);
        }

        return PageResponse.from(page, this::toResponse);
    }

    @Override
    @Transactional
    public SignatureResponse updateStatus(Long id, Integer status) {
        log.info("更新签名状态: id={}, status={}", id, status);

        PersonalSignature signature = signatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("签名不存在: id=" + id));

        signatureRepository.updateStatus(id, status);

        // 重新加载实体
        signature = signatureRepository.findById(id).orElseThrow();
        log.info("签名状态更新成功: id={}", id);

        return toResponse(signature);
    }

    /**
     * 转换为响应 DTO
     *
     * @param entity 实体
     * @return 响应 DTO
     */
    private SignatureResponse toResponse(PersonalSignature entity) {
        return SignatureResponse.fromEntity(entity, baseUrl);
    }
}
