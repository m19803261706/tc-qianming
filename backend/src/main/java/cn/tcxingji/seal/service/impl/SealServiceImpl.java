package cn.tcxingji.seal.service.impl;

import cn.tcxingji.seal.dto.request.SealCreateRequest;
import cn.tcxingji.seal.dto.request.SealQueryRequest;
import cn.tcxingji.seal.dto.request.SealUpdateRequest;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SealResponse;
import cn.tcxingji.seal.entity.SealInfo;
import cn.tcxingji.seal.exception.BusinessException;
import cn.tcxingji.seal.repository.SealInfoRepository;
import cn.tcxingji.seal.service.SealService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 印章服务实现类
 * <p>
 * 实现印章管理的业务逻辑
 * </p>
 *
 * @author TC System
 * @since 2026-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SealServiceImpl implements SealService {

    private final SealInfoRepository sealInfoRepository;

    /**
     * 创建印章
     */
    @Override
    @Transactional
    public SealResponse create(SealCreateRequest request) {
        log.info("创建印章: {}", request.getSealName());

        // 检查印章名称是否已存在
        if (sealInfoRepository.existsBySealNameAndOwnerIdAndOwnerType(
                request.getSealName(), request.getOwnerId(), request.getOwnerType())) {
            throw new BusinessException("印章名称已存在");
        }

        // 校验印章类型
        validateSealType(request.getSealType());
        // 校验印章来源
        validateSealSource(request.getSealSource());
        // 校验所有者类型
        validateOwnerType(request.getOwnerType());

        // 构建实体
        SealInfo sealInfo = SealInfo.builder()
                .sealName(request.getSealName())
                .sealType(request.getSealType())
                .sealImage(request.getSealImage())
                .sealSource(request.getSealSource())
                .ownerId(request.getOwnerId())
                .ownerType(request.getOwnerType())
                .status(SealInfo.Status.ENABLED)
                .build();

        // 保存并返回
        SealInfo saved = sealInfoRepository.save(sealInfo);
        log.info("印章创建成功: id={}", saved.getId());

        return SealResponse.fromEntity(saved);
    }

    /**
     * 根据ID获取印章详情
     */
    @Override
    public SealResponse getById(Long id) {
        log.debug("获取印章详情: id={}", id);

        SealInfo sealInfo = findByIdOrThrow(id);
        return SealResponse.fromEntity(sealInfo);
    }

    /**
     * 更新印章
     */
    @Override
    @Transactional
    public SealResponse update(Long id, SealUpdateRequest request) {
        log.info("更新印章: id={}", id);

        SealInfo sealInfo = findByIdOrThrow(id);

        // 更新字段（仅更新非空字段）
        if (StringUtils.hasText(request.getSealName())) {
            // 检查新名称是否与其他印章冲突
            if (!request.getSealName().equals(sealInfo.getSealName()) &&
                    sealInfoRepository.existsBySealNameAndOwnerIdAndOwnerType(
                            request.getSealName(), sealInfo.getOwnerId(), sealInfo.getOwnerType())) {
                throw new BusinessException("印章名称已存在");
            }
            sealInfo.setSealName(request.getSealName());
        }

        if (request.getSealType() != null) {
            validateSealType(request.getSealType());
            sealInfo.setSealType(request.getSealType());
        }

        if (StringUtils.hasText(request.getSealImage())) {
            sealInfo.setSealImage(request.getSealImage());
        }

        if (request.getSealSource() != null) {
            validateSealSource(request.getSealSource());
            sealInfo.setSealSource(request.getSealSource());
        }

        // 保存并返回
        SealInfo saved = sealInfoRepository.save(sealInfo);
        log.info("印章更新成功: id={}", saved.getId());

        return SealResponse.fromEntity(saved);
    }

    /**
     * 删除印章
     */
    @Override
    @Transactional
    public void delete(Long id) {
        log.info("删除印章: id={}", id);

        if (!sealInfoRepository.existsById(id)) {
            throw new BusinessException(404, "印章不存在");
        }

        sealInfoRepository.deleteById(id);
        log.info("印章删除成功: id={}", id);
    }

    /**
     * 更新印章状态
     */
    @Override
    @Transactional
    public SealResponse updateStatus(Long id, Integer status) {
        log.info("更新印章状态: id={}, status={}", id, status);

        // 校验状态值
        if (status == null || (status != SealInfo.Status.DISABLED && status != SealInfo.Status.ENABLED)) {
            throw new BusinessException("无效的状态值");
        }

        SealInfo sealInfo = findByIdOrThrow(id);
        sealInfo.setStatus(status);

        SealInfo saved = sealInfoRepository.save(sealInfo);
        log.info("印章状态更新成功: id={}, status={}", saved.getId(), saved.getStatus());

        return SealResponse.fromEntity(saved);
    }

    /**
     * 分页查询印章列表
     * <p>
     * 支持动态条件筛选：印章名称、印章类型、所有者、状态等
     * </p>
     */
    @Override
    public PageResponse<SealResponse> queryPage(SealQueryRequest request) {
        log.debug("分页查询印章: {}", request);

        // 构建分页参数
        Pageable pageable = PageRequest.of(
                request.getPage() != null ? request.getPage() : 0,
                request.getSize() != null ? request.getSize() : 10,
                Sort.by(Sort.Direction.DESC, "createTime")
        );

        // 构建动态查询条件
        Specification<SealInfo> spec = buildQuerySpecification(request);

        // 执行查询
        Page<SealInfo> page = sealInfoRepository.findAll(spec, pageable);

        return PageResponse.from(page, SealResponse::fromEntity);
    }

    /**
     * 构建动态查询条件
     *
     * @param request 查询请求
     * @return JPA Specification
     */
    private Specification<SealInfo> buildQuerySpecification(SealQueryRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 印章名称模糊查询
            if (StringUtils.hasText(request.getSealName())) {
                predicates.add(criteriaBuilder.like(
                        root.get("sealName"),
                        "%" + request.getSealName() + "%"
                ));
            }

            // 印章类型精确查询
            if (request.getSealType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("sealType"), request.getSealType()));
            }

            // 所有者ID精确查询
            if (request.getOwnerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("ownerId"), request.getOwnerId()));
            }

            // 所有者类型精确查询
            if (request.getOwnerType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("ownerType"), request.getOwnerType()));
            }

            // 状态精确查询
            if (request.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), request.getStatus()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * 获取所有者的所有印章
     */
    @Override
    public List<SealResponse> listByOwner(Long ownerId, Integer ownerType) {
        log.debug("查询所有者印章列表: ownerId={}, ownerType={}", ownerId, ownerType);

        List<SealInfo> seals = sealInfoRepository.findByOwnerIdAndOwnerType(ownerId, ownerType);
        return seals.stream()
                .map(SealResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 获取所有者的启用印章
     */
    @Override
    public List<SealResponse> listEnabledByOwner(Long ownerId, Integer ownerType) {
        log.debug("查询所有者启用印章列表: ownerId={}, ownerType={}", ownerId, ownerType);

        List<SealInfo> seals = sealInfoRepository.findByOwnerIdAndOwnerTypeAndStatus(
                ownerId, ownerType, SealInfo.Status.ENABLED);
        return seals.stream()
                .map(SealResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==================== 私有方法 ====================

    /**
     * 根据ID查找印章，不存在则抛出异常
     */
    private SealInfo findByIdOrThrow(Long id) {
        return sealInfoRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "印章不存在"));
    }

    /**
     * 校验印章类型
     */
    private void validateSealType(Integer sealType) {
        if (sealType == null) {
            throw new BusinessException("印章类型不能为空");
        }
        if (sealType < SealInfo.SealType.COMPANY_SEAL || sealType > SealInfo.SealType.PERSONAL_SIGNATURE) {
            throw new BusinessException("无效的印章类型");
        }
    }

    /**
     * 校验印章来源
     */
    private void validateSealSource(Integer sealSource) {
        if (sealSource == null) {
            throw new BusinessException("印章来源不能为空");
        }
        if (sealSource < SealInfo.SealSource.UPLOAD || sealSource > SealInfo.SealSource.TEMPLATE) {
            throw new BusinessException("无效的印章来源");
        }
    }

    /**
     * 校验所有者类型
     */
    private void validateOwnerType(Integer ownerType) {
        if (ownerType == null) {
            throw new BusinessException("所有者类型不能为空");
        }
        if (ownerType < SealInfo.OwnerType.ENTERPRISE || ownerType > SealInfo.OwnerType.PERSONAL) {
            throw new BusinessException("无效的所有者类型");
        }
    }
}
