package cn.tcxingji.seal.controller;

import cn.tcxingji.seal.dto.response.ApiResponse;
import cn.tcxingji.seal.dto.response.PageResponse;
import cn.tcxingji.seal.dto.response.SealRecordResponse;
import cn.tcxingji.seal.entity.SealRecord;
import cn.tcxingji.seal.repository.SealRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 签章记录 Controller
 * <p>
 * 提供签章记录的查询和管理接口
 * </p>
 *
 * @author TC System
 * @since 2026-01-02
 */
@Slf4j
@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class SealRecordController {

    private final SealRecordRepository sealRecordRepository;

    /**
     * 分页查询签章记录列表
     *
     * @param page      页码（从1开始）
     * @param size      每页数量
     * @param sealType  签章类型（可选）：1-普通章 2-骑缝章 3-个人签名
     * @param startDate 开始日期（可选）
     * @param endDate   结束日期（可选）
     * @param keyword   搜索关键词（操作人姓名，可选）
     * @return 签章记录分页列表
     */
    @GetMapping
    public ApiResponse<PageResponse<SealRecordResponse>> getRecords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer sealType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String keyword) {

        log.debug("查询签章记录列表: page={}, size={}, sealType={}, startDate={}, endDate={}, keyword={}",
                page, size, sealType, startDate, endDate, keyword);

        // 转换分页参数（前端从1开始，JPA从0开始）
        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                size,
                Sort.by(Sort.Direction.DESC, "sealTime")
        );

        Page<SealRecord> recordPage;

        // 根据条件查询
        if (startDate != null && endDate != null) {
            // 时间范围查询
            LocalDateTime startTime = startDate.atStartOfDay();
            LocalDateTime endTime = endDate.atTime(LocalTime.MAX);
            recordPage = sealRecordRepository.findByTimeRange(startTime, endTime, pageable);
        } else if (sealType != null) {
            // 按类型查询
            recordPage = sealRecordRepository.findAll(
                    (root, query, cb) -> cb.equal(root.get("sealType"), sealType),
                    pageable
            );
        } else {
            // 全部查询
            recordPage = sealRecordRepository.findAll(pageable);
        }

        // 转换为响应 DTO
        List<SealRecordResponse> content = recordPage.getContent().stream()
                .map(SealRecordResponse::fromEntity)
                .toList();

        PageResponse<SealRecordResponse> pageResponse = PageResponse.<SealRecordResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(recordPage.getTotalElements())
                .totalPages(recordPage.getTotalPages())
                .first(recordPage.isFirst())
                .last(recordPage.isLast())
                .hasNext(recordPage.hasNext())
                .hasPrevious(recordPage.hasPrevious())
                .build();

        return ApiResponse.success(pageResponse);
    }

    /**
     * 获取签章记录详情
     *
     * @param id 记录ID
     * @return 签章记录详情
     */
    @GetMapping("/{id}")
    public ApiResponse<SealRecordResponse> getRecord(@PathVariable Long id) {
        log.debug("获取签章记录详情: id={}", id);

        return sealRecordRepository.findById(id)
                .map(record -> ApiResponse.success(SealRecordResponse.fromEntity(record)))
                .orElse(ApiResponse.error(404, "签章记录不存在"));
    }

    /**
     * 获取签章统计数据
     *
     * @return 统计数据
     */
    @GetMapping("/stats")
    public ApiResponse<RecordStats> getStats() {
        log.debug("获取签章统计数据");

        long totalRecords = sealRecordRepository.count();
        long normalSeals = sealRecordRepository.findBySealType(1).size();
        long perforationSeals = sealRecordRepository.findBySealType(2).size();
        long personalSignatures = sealRecordRepository.findBySealType(3).size();

        RecordStats stats = new RecordStats(totalRecords, normalSeals, perforationSeals, personalSignatures);
        return ApiResponse.success(stats);
    }

    /**
     * 签章统计数据内部类
     */
    public record RecordStats(
            long totalRecords,
            long normalSeals,
            long perforationSeals,
            long personalSignatures
    ) {}
}
